package com.mohamedwaleed.nasaproject.data.local.entity

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(
    tableName = "measurement_entries",
    foreignKeys = [
        ForeignKey(
            entity = DailyLogEntity::class,
            parentColumns = ["logId"],
            childColumns = ["log_owner_id"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [Index(value = ["log_owner_id"])]
)
data class MeasurementEntryEntity(
    @PrimaryKey(autoGenerate = true)
    val entryId: Long = 0,

    @ColumnInfo(name = "log_owner_id")
    val logOwnerId: Long,

    @ColumnInfo(name = "metric_id")
    val metricId: Int, // 1 to 19

    @ColumnInfo(name = "metric_name")
    val metricName: String,

    @ColumnInfo(name = "unit")
    val unit: String,

    @ColumnInfo(name = "measured_value")
    val measuredValue: Double,

    @ColumnInfo(name = "baseline_value")
    val baselineValue: Double,

    @ColumnInfo(name = "tolerance")
    val tolerance: Double,

    @ColumnInfo(name = "difference")
    val difference: Double,

    @ColumnInfo(name = "status")
    val status: String // "WITHIN_RANGE", "TOO_LOW", "TOO_HIGH"
)