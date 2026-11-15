package com.mohamedwaleed.nasaproject.ui

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import com.mohamedwaleed.nasaproject.model.ComparisonStatus
import com.mohamedwaleed.nasaproject.model.MeasurementItem
import java.util.Locale

@Composable
fun MeasurementCard(
    item: MeasurementItem,
    onValueChange: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    val diffText = item.difference?.let {
        String.format(Locale.US, "%+.2f %s", it, item.unit)
    } ?: ""

    val (statusLabel, statusColor) = when (item.status) {
        ComparisonStatus.EMPTY -> "Awaiting input" to MaterialTheme.colorScheme.onSurfaceVariant
        ComparisonStatus.WITHIN_RANGE -> "Pass ($diffText)" to Color(0xFF2E7D32)
        ComparisonStatus.TOO_LOW -> "Too Low ($diffText)" to Color(0xFFD32F2F)
        ComparisonStatus.TOO_HIGH -> "Too High ($diffText)" to Color(0xFFED6C02)
    }

    Card(
        modifier = modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "${item.id}. ${item.name}",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.weight(1f)
                )
                Text(
                    text = "Target: ${item.baseline} ±${item.tolerance} ${item.unit}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                OutlinedTextField(
                    value = item.userInput,
                    onValueChange = onValueChange,
                    label = { Text("Value (${item.unit})") },
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(
                        keyboardType = KeyboardType.Decimal,
                        imeAction = ImeAction.Next
                    ),
                    modifier = Modifier.weight(1f)
                )

                Surface(
                    color = statusColor.copy(alpha = 0.12f),
                    shape = MaterialTheme.shapes.small,
                    modifier = Modifier.weight(1f)
                ) {
                    Text(
                        text = statusLabel,
                        color = statusColor,
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = FontWeight.SemiBold,
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 10.dp)
                    )
                }
            }
        }
    }
}