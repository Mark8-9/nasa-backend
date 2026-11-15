package com.mohamedwaleed.nasaproject.data.remote

import com.google.gson.annotations.SerializedName

data class MeasurementSyncRequest(
    @SerializedName("astronautId")
    val astronautId: String,

    @SerializedName("analyte")
    val analyte: String,

    @SerializedName("value")
    val value: Double
)