package com.mohamedwaleed.nasaproject.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.Query
import androidx.room.Transaction
import com.mohamedwaleed.nasaproject.data.local.entity.DailyLogEntity
import com.mohamedwaleed.nasaproject.data.local.entity.DailyLogWithEntries
import com.mohamedwaleed.nasaproject.data.local.entity.MeasurementEntryEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface MeasurementDao {
    @Insert
    suspend fun insertLog(log: DailyLogEntity): Long

    @Insert
    suspend fun insertEntries(entries: List<MeasurementEntryEntity>)

    // Saves the daily header + all measurements atomically
    @Transaction
    suspend fun saveFullDailyLog(
        date: String,
        entries: List<MeasurementEntryEntity>
    ) {
        val generatedLogId = insertLog(DailyLogEntity(date = date))
        val linkedEntries = entries.map { it.copy(logOwnerId = generatedLogId) }
        insertEntries(linkedEntries)
    }

    // Use this in the UI to view all saved daily records
    @Transaction
    @Query("SELECT * FROM daily_logs ORDER BY created_at DESC")
    fun getAllLogsFlow(): Flow<List<DailyLogWithEntries>>

    // Ready for later: fetch only unsent days to push to your web API
    @Transaction
    @Query("SELECT * FROM daily_logs WHERE is_synced_to_server = 0 ORDER BY created_at DESC")
    suspend fun getUnsyncedLogs(): List<DailyLogWithEntries>

    @Query("UPDATE daily_logs SET is_synced_to_server = 1 WHERE logId = :logId")
    suspend fun markLogAsSynced(logId: Long)

    @Query("DELETE FROM daily_logs WHERE logId = :logId")
    suspend fun deleteLogById(logId: Long)
}