package com.mohamedwaleed.nasaproject.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.CreationExtras
import com.mohamedwaleed.nasaproject.NasaApplication
import com.mohamedwaleed.nasaproject.data.local.entity.DailyLogWithEntries
import com.mohamedwaleed.nasaproject.data.remote.AuthRepository
import com.mohamedwaleed.nasaproject.data.repository.MeasurementRepository
import com.mohamedwaleed.nasaproject.model.MeasurementItem
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class MeasurementViewModel(
    private val repository: MeasurementRepository,
    private val authRepository: AuthRepository
) : ViewModel() {

    private val decimalRegex = Regex("^\\d*(\\.\\d*)?$")

    private val _authenticatedId = MutableStateFlow(authRepository.getCurrentAstronautId())
    private val _isAuthenticating = MutableStateFlow(false)
    private val _authError = MutableStateFlow<String?>(null)
    private val _measurements = MutableStateFlow(
        _authenticatedId.value?.let { repository.getBaselinesForAstronaut(it) } ?: emptyList()
    )
    private val _selectedFilter = MutableStateFlow(EntryFilter.ALL)
    private val _isSaving = MutableStateFlow(false)
    private val _isSyncing = MutableStateFlow(false)
    private val _snackbarMessage = MutableStateFlow<String?>(null)

    init {
        viewModelScope.launch {
            authRepository.observeAuthAstronautId().collect { id ->
                _authenticatedId.value = id
                _measurements.value = if (id != null) {
                    repository.getBaselinesForAstronaut(id)
                } else {
                    emptyList()
                }
                _selectedFilter.value = EntryFilter.ALL
            }
        }
    }

    val uiState: StateFlow<MeasurementUiState> = combine(
        _authenticatedId,
        _isAuthenticating,
        _authError,
        _measurements,
        _selectedFilter,
        repository.observeSavedLogs(),
        _isSaving,
        _isSyncing,
        _snackbarMessage
    ) { values ->
        val authenticatedId = values[0] as String?
        val isAuthenticating = values[1] as Boolean
        val authError = values[2] as String?
        @Suppress("UNCHECKED_CAST")
        val measurements = values[3] as List<MeasurementItem>
        val filter = values[4] as EntryFilter
        @Suppress("UNCHECKED_CAST")
        val logs = values[5] as List<DailyLogWithEntries>
        val saving = values[6] as Boolean
        val syncing = values[7] as Boolean
        val message = values[8] as String?

        MeasurementUiState(
            authenticatedAstronautId = authenticatedId,
            isAuthenticating = isAuthenticating,
            authError = authError,
            measurements = measurements,
            selectedFilter = filter,
            savedLogs = logs,
            isSaving = saving,
            isSyncing = syncing,
            snackbarMessage = message
        )
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5_000),
        initialValue = MeasurementUiState(
            authenticatedAstronautId = _authenticatedId.value,
            measurements = _measurements.value
        )
    )

    fun onLogin(userId: String, password: String) {
        viewModelScope.launch {
            _isAuthenticating.value = true
            _authError.value = null
            val result = authRepository.login(userId, password)
            result.onFailure { error ->
                _authError.value = error.message
            }
            _isAuthenticating.value = false
        }
    }

    fun onLogout() {
        authRepository.logout()
    }

    fun onInputChanged(id: Int, rawInput: String) {
        if (!decimalRegex.matches(rawInput)) return
        _measurements.update { list ->
            list.map { item ->
                if (item.id == id) item.copy(userInput = rawInput) else item
            }
        }
    }

    fun onFilterSelected(filter: EntryFilter) {
        _selectedFilter.value = filter
    }

    fun onClearAllInputs() {
        _measurements.update { list -> list.map { it.copy(userInput = "") } }
    }

    fun onSaveClicked() {
        val astronautId = _authenticatedId.value ?: return
        val currentList = _measurements.value
        val missing = currentList.count { it.parsedValue == null }
        if (missing > 0) {
            _snackbarMessage.value = "$missing of ${currentList.size} measurements are still empty"
            return
        }

        val todayDate = SimpleDateFormat("yyyy-MM-dd", Locale.US).format(Date())
        val recordLabel = "$todayDate • $astronautId"

        viewModelScope.launch {
            _isSaving.value = true
            try {
                repository.saveDailyMeasurements(date = recordLabel, items = currentList)
                onClearAllInputs()

                val syncResult = repository.syncPendingLogs()
                _snackbarMessage.value = syncResult.fold(
                    onSuccess = { "Saved & synced to web dashboard for $astronautId" },
                    onFailure = { "Saved locally (will sync when dashboard is reachable)" }
                )
            } catch (e: Exception) {
                _snackbarMessage.value = "Save failed: ${e.localizedMessage}"
            } finally {
                _isSaving.value = false
            }
        }
    }

    fun onSyncNowClicked() {
        if (_isSyncing.value) return
        viewModelScope.launch {
            _isSyncing.value = true
            val result = repository.syncPendingLogs()
            _snackbarMessage.value = result.fold(
                onSuccess = { count ->
                    if (count == 0) "All logs are already synced"
                    else "Synced $count log(s) to web dashboard"
                },
                onFailure = { error ->
                    "Sync failed: ${error.localizedMessage ?: "Check connection"}"
                }
            )
            _isSyncing.value = false
        }
    }

    fun onDeleteLog(logId: Long) {
        viewModelScope.launch {
            repository.deleteLog(logId)
            _snackbarMessage.value = "Log deleted"
        }
    }

    fun onSnackbarDismissed() {
        _snackbarMessage.value = null
    }

    companion object {
        val Factory: ViewModelProvider.Factory = object : ViewModelProvider.Factory {
            @Suppress("UNCHECKED_CAST")
            override fun <T : ViewModel> create(modelClass: Class<T>, extras: CreationExtras): T {
                val app = checkNotNull(
                    extras[ViewModelProvider.AndroidViewModelFactory.APPLICATION_KEY]
                ) as NasaApplication
                return MeasurementViewModel(app.repository, app.authRepository) as T
            }
        }
    }
}