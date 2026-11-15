package com.mohamedwaleed.nasaproject.data.local.entity

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "daily_logs")
data class DailyLogEntity(
    @PrimaryKey(autoGenerate = true)
    val logId: Long = 0,

    @ColumnInfo(name = "date")
    val date: String, // e.g., "2026-11-14"

    @ColumnInfo(name = "created_at")
    val createdAt: Long = System.currentTimeMillis(),

    // Ready for later: filter WHERE is_sent_to_server = 0 when you add the API
    @ColumnInfo(name = "is_synced_to_server")
    val isSyncedToServer: Boolean = false
)