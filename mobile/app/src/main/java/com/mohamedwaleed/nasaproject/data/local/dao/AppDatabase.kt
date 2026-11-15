package com.mohamedwaleed.nasaproject.data.local.dao

import androidx.room.RoomDatabase
import androidx.room.Database
import com.mohamedwaleed.nasaproject.data.local.entity.DailyLogEntity
import com.mohamedwaleed.nasaproject.data.local.entity.MeasurementEntryEntity

@Database(
    entities = [DailyLogEntity::class, MeasurementEntryEntity::class],
    version = 2,
    exportSchema = false
)
abstract class AppDatabase : RoomDatabase() {
    abstract fun measurementDao(): MeasurementDao
}