package com.mohamedwaleed.nasaproject.model

data class MeasurementItem(
    val id: Int,
    val name: String,
    val unit: String,
    val baseline: Double,
    val tolerance: Double,
    val userInput: String = ""
) {
    val parsedValue: Double?
        get() = userInput.toDoubleOrNull()

    val difference: Double?
        get() = parsedValue?.let { it - baseline }

    val status: ComparisonStatus
        get() {
            val value = parsedValue ?: return ComparisonStatus.EMPTY
            return when {
                value < (baseline - tolerance) -> ComparisonStatus.TOO_LOW
                value > (baseline + tolerance) -> ComparisonStatus.TOO_HIGH
                else -> ComparisonStatus.WITHIN_RANGE
            }
        }
}