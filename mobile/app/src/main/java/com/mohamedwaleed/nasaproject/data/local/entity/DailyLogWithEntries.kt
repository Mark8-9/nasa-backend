package com.mohamedwaleed.nasaproject.data.local.entity

import androidx.room.Embedded
import androidx.room.Relation

data class DailyLogWithEntries(
    @Embedded val log: DailyLogEntity,
    @Relation(
        parentColumn = "logId",
        entityColumn = "log_owner_id"
    )
    val entries: List<MeasurementEntryEntity>
)