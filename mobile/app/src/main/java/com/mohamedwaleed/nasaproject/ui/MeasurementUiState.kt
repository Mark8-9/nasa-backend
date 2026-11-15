package com.mohamedwaleed.nasaproject.ui

import com.mohamedwaleed.nasaproject.data.local.entity.DailyLogWithEntries
import com.mohamedwaleed.nasaproject.model.ComparisonStatus
import com.mohamedwaleed.nasaproject.model.MeasurementItem

enum class EntryFilter(val label: String) {
    ALL("All"),
    REMAINING("Remaining"),
    OUT_OF_RANGE("Out of Range")
}

data class MeasurementUiState(
    val authenticatedAstronautId: String? = null,
    val isAuthenticating: Boolean = false,
    val authError: String? = null,
    val measurements: List<MeasurementItem> = emptyList(),
    val selectedFilter: EntryFilter = EntryFilter.ALL,
    val savedLogs: List<DailyLogWithEntries> = emptyList(),
    val isSaving: Boolean = false,
    val isSyncing: Boolean = false,
    val snackbarMessage: String? = null
) {
    val astronautLogs: List<DailyLogWithEntries>
        get() {
            val id = authenticatedAstronautId ?: return emptyList()
            return savedLogs.filter { it.log.date.endsWith("• $id") }
        }

    val unsyncedCount: Int
        get() = astronautLogs.count { !it.log.isSyncedToServer }

    val filteredMeasurements: List<MeasurementItem>
        get() = when (selectedFilter) {
            EntryFilter.ALL -> measurements
            EntryFilter.REMAINING -> measurements.filter { it.parsedValue == null }
            EntryFilter.OUT_OF_RANGE -> measurements.filter {
                it.status == ComparisonStatus.TOO_LOW || it.status == ComparisonStatus.TOO_HIGH
            }
        }

    val completedCount: Int
        get() = measurements.count { it.parsedValue != null }

    val totalCount: Int
        get() = measurements.size

    val passCount: Int
        get() = measurements.count { it.status == ComparisonStatus.WITHIN_RANGE }

    val outOfRangeCount: Int
        get() = measurements.count {
            it.status == ComparisonStatus.TOO_LOW || it.status == ComparisonStatus.TOO_HIGH
        }
}