package com.mohamedwaleed.nasaproject.ui

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.DateRange
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Info
import androidx.compose.material3.Badge
import androidx.compose.material3.BadgedBox
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.lifecycle.viewmodel.compose.viewModel

enum class AppTab(val label: String) {
    DAILY_ENTRY("Daily Check"),
    SAVED_LOGS("Saved Logs"),
    BASELINES("Baselines")
}

@Composable
fun MainAppScreen(
    viewModel: MeasurementViewModel = viewModel(factory = MeasurementViewModel.Factory)
) {
    val state by viewModel.uiState.collectAsState()

    if (state.authenticatedAstronautId == null) {
        LoginScreen(
            isLoading = state.isAuthenticating,
            errorMessage = state.authError,
            onLoginClick = viewModel::onLogin
        )
        return
    }

    val astronautId = state.authenticatedAstronautId!!
    var selectedTab by rememberSaveable { mutableStateOf(AppTab.DAILY_ENTRY) }
    val snackbarHostState = remember { SnackbarHostState() }

    LaunchedEffect(state.snackbarMessage) {
        state.snackbarMessage?.let { message ->
            snackbarHostState.showSnackbar(message)
            viewModel.onSnackbarDismissed()
        }
    }

    Scaffold(
        snackbarHost = { SnackbarHost(hostState = snackbarHostState) },
        bottomBar = {
            NavigationBar {
                NavigationBarItem(
                    selected = selectedTab == AppTab.DAILY_ENTRY,
                    onClick = { selectedTab = AppTab.DAILY_ENTRY },
                    icon = { Icon(Icons.Default.Edit, contentDescription = "Daily Check") },
                    label = { Text(AppTab.DAILY_ENTRY.label) }
                )
                NavigationBarItem(
                    selected = selectedTab == AppTab.SAVED_LOGS,
                    onClick = { selectedTab = AppTab.SAVED_LOGS },
                    icon = {
                        BadgedBox(
                            badge = {
                                if (state.astronautLogs.isNotEmpty()) {
                                    Badge { Text("${state.astronautLogs.size}") }
                                }
                            }
                        ) {
                            Icon(Icons.Default.DateRange, contentDescription = "Saved Logs")
                        }
                    },
                    label = { Text(AppTab.SAVED_LOGS.label) }
                )
                NavigationBarItem(
                    selected = selectedTab == AppTab.BASELINES,
                    onClick = { selectedTab = AppTab.BASELINES },
                    icon = { Icon(Icons.Default.Info, contentDescription = "Baselines") },
                    label = { Text(AppTab.BASELINES.label) }
                )
            }
        }
    ) { innerPadding ->
        Box(modifier = Modifier.padding(innerPadding)) {
            when (selectedTab) {
                AppTab.DAILY_ENTRY -> DailyEntryTab(
                    astronautId = astronautId,
                    state = state,
                    onValueChange = viewModel::onInputChanged,
                    onFilterSelected = viewModel::onFilterSelected,
                    onClearAll = viewModel::onClearAllInputs,
                    onSaveClicked = viewModel::onSaveClicked,
                    onLogout = viewModel::onLogout
                )
                AppTab.SAVED_LOGS -> SavedLogsTab(
                    astronautId = astronautId,
                    logs = state.astronautLogs,
                    unsyncedCount = state.unsyncedCount,
                    isSyncing = state.isSyncing,
                    onSyncNow = viewModel::onSyncNowClicked,
                    onDeleteLog = viewModel::onDeleteLog,
                    onLogout = viewModel::onLogout
                )
                AppTab.BASELINES -> BaselinesTab(
                    astronautId = astronautId,
                    baselines = state.measurements,
                    onLogout = viewModel::onLogout
                )
            }
        }
    }
}