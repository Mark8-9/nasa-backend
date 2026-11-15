package com.mohamedwaleed.nasaproject.data.repository

import com.mohamedwaleed.nasaproject.data.local.dao.MeasurementDao
import com.mohamedwaleed.nasaproject.data.local.entity.DailyLogWithEntries
import com.mohamedwaleed.nasaproject.data.local.entity.MeasurementEntryEntity
import com.mohamedwaleed.nasaproject.model.MeasurementItem
import kotlinx.coroutines.flow.Flow

// Replace the old SyncLogRequest imports at the top with:
import com.mohamedwaleed.nasaproject.data.remote.DashboardApiService
import com.mohamedwaleed.nasaproject.data.remote.MeasurementSyncRequest
import com.mohamedwaleed.nasaproject.data.remote.RetrofitClient

class MeasurementRepository(
    private val dao: MeasurementDao,
    private val apiService: DashboardApiService = RetrofitClient.apiService
) {
    private data class MetricTemplate(
        val id: Int,
        val name: String,
        val unit: String,
        val tolerance: Double
    )

    private val metricTemplates = listOf(
        MetricTemplate(1, "Absolute Basophils", "cells/µL", 25.0),
        MetricTemplate(2, "Absolute Eosinophils", "cells/µL", 100.0),
        MetricTemplate(3, "Absolute Lymphocytes", "cells/µL", 750.0),
        MetricTemplate(4, "Absolute Monocytes", "cells/µL", 200.0),
        MetricTemplate(5, "Absolute Neutrophils", "cells/µL", 1200.0),
        MetricTemplate(6, "Basophils", "%", 0.4),
        MetricTemplate(7, "Eosinophils", "%", 1.2),
        MetricTemplate(8, "Hematocrit", "%", 4.5),
        MetricTemplate(9, "Hemoglobin", "g/dL", 1.5),
        MetricTemplate(10, "Lymphocytes", "%", 8.0),
        MetricTemplate(11, "MCH", "pg", 2.0),
        MetricTemplate(12, "MCHC", "g/dL", 1.5),
        MetricTemplate(13, "MCV", "fL", 5.0),
        MetricTemplate(14, "Monocytes", "%", 3.0),
        MetricTemplate(15, "MPV", "fL", 1.2),
        MetricTemplate(16, "Neutrophils", "%", 10.0),
        MetricTemplate(17, "Platelet Count", "10³/µL", 60.0),
        MetricTemplate(18, "RDW", "%", 1.0),
        MetricTemplate(19, "Red Blood Cell Count", "10⁶/µL", 0.50),
        MetricTemplate(20, "White Blood Cell Count", "10³/µL", 2.0)
    )

    private val astronautBaselines: Map<String, Map<Int, Double?>> = mapOf(
        "C001" to mapOf(
            1 to 50.0, 2 to 204.0, 3 to 2241.0, 4 to 481.0, 5 to 2998.0,
            6 to 0.9, 7 to 3.7, 8 to 44.5, 9 to 14.7, 10 to 38.1,
            11 to 30.8, 12 to 33.0, 13 to 93.0, 14 to 7.9, 15 to 10.6,
            16 to 51.0, 17 to 241.0, 18 to 12.6, 19 to 4.69, 20 to 5.5
        ),
        "C002" to mapOf(
            1 to 32.0, 2 to 211.0, 3 to 2119.0, 4 to 364.0, 5 to 3701.0,
            6 to 0.5, 7 to 3.9, 8 to 37.8, 9 to 12.8, 10 to 36.7,
            11 to 30.9, 12 to null, 13 to 96.2, 14 to 5.6, 15 to 10.8,
            16 to 53.2, 17 to 241.0, 18 to 12.6, 19 to 3.93, 20 to 6.5
        ),
        "C003" to mapOf(
            1 to 49.0, 2 to 130.0, 3 to 3156.0, 4 to 715.0, 5 to 5792.0,
            6 to 0.5, 7 to 1.3, 8 to 41.6, 9 to 13.3, 10 to 22.4,
            11 to 30.4, 12 to 32.0, 13 to 92.2, 14 to 6.8, 15 to 10.8,
            16 to 68.9, 17 to 345.0, 18 to 13.2, 19 to 4.50, 20 to 9.6
        ),
        "C004" to mapOf(
            1 to 83.0, 2 to 200.0, 3 to 1786.0, 4 to 870.0, 5 to 4766.0,
            6 to 1.0, 7 to 2.6, 8 to 49.1, 9 to 16.8, 10 to 25.2,
            11 to 30.45, 12 to 34.3, 13 to 89.8, 14 to 11.3, 15 to 9.9,
            16 to 59.6, 17 to 239.0, 18 to 12.7, 19 to 5.48, 20 to 7.7
        )
    )

    fun getBaselinesForAstronaut(astronautId: String): List<MeasurementItem> {
        val profile = astronautBaselines[astronautId] ?: astronautBaselines.getValue("C001")
        return metricTemplates.mapNotNull { template ->
            val baselineValue = profile[template.id] ?: return@mapNotNull null
            MeasurementItem(
                id = template.id,
                name = template.name,
                unit = template.unit,
                baseline = baselineValue,
                tolerance = template.tolerance
            )
        }
    }

    suspend fun saveDailyMeasurements(date: String, items: List<MeasurementItem>) {
        val entities = items.map { item ->
            MeasurementEntryEntity(
                logOwnerId = 0,
                metricId = item.id,
                metricName = item.name,
                unit = item.unit,
                measuredValue = item.parsedValue!!,
                baselineValue = item.baseline,
                tolerance = item.tolerance,
                difference = item.difference ?: 0.0,
                status = item.status.name
            )
        }
        dao.saveFullDailyLog(date = date, entries = entities)
    }

    suspend fun syncPendingLogs(): Result<Int> {
        return try {
            val unsyncedLogs = dao.getUnsyncedLogs()
            if (unsyncedLogs.isEmpty()) return Result.success(0)

            var syncedLogCount = 0
            for (record in unsyncedLogs) {
                val astronautId = record.log.date
                    .split(" • ")
                    .getOrElse(1) { "UNKNOWN" }

                for (entry in record.entries.sortedBy { it.metricId }) {
                    val payload = MeasurementSyncRequest(
                        astronautId = astronautId,
                        analyte = entry.metricName.trim().lowercase().replace(" ", "_"),
                        value = entry.measuredValue
                    )

                    val response = apiService.uploadMeasurement(payload)
                    if (!response.isSuccessful) {
                        return Result.failure(
                            Exception("Failed on ${entry.metricName}: HTTP ${response.code()}")
                        )
                    }
                }

                dao.markLogAsSynced(record.log.logId)
                syncedLogCount++
            }
            Result.success(syncedLogCount)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }


    fun observeSavedLogs(): Flow<List<DailyLogWithEntries>> = dao.getAllLogsFlow()

    suspend fun deleteLog(logId: Long) = dao.deleteLogById(logId)
}