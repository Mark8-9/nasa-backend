package com.mohamedwaleed.nasaproject

import android.app.Application
import androidx.room.Room
import com.mohamedwaleed.nasaproject.data.local.dao.AppDatabase
import com.mohamedwaleed.nasaproject.data.repository.MeasurementRepository
import com.mohamedwaleed.nasaproject.data.remote.AuthRepository
import kotlin.getValue

class NasaApplication : Application() {
    val database by lazy {
        Room.databaseBuilder(
            applicationContext,
            AppDatabase::class.java,
            "nasa_measurements.db"
        )
            .fallbackToDestructiveMigration(dropAllTables = true)
            .build()
    }

    val repository by lazy { MeasurementRepository(database.measurementDao()) }
    val authRepository by lazy { AuthRepository() }
}