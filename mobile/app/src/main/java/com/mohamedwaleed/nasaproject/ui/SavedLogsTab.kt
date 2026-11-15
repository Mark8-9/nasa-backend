package com.mohamedwaleed.nasaproject.ui

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material.icons.filled.KeyboardArrowUp
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.mohamedwaleed.nasaproject.data.local.entity.DailyLogWithEntries
import com.mohamedwaleed.nasaproject.ui.theme.AlertRed
import com.mohamedwaleed.nasaproject.ui.theme.CyanSecondary
import com.mohamedwaleed.nasaproject.ui.theme.SafeGreen
import com.mohamedwaleed.nasaproject.ui.theme.WarningOrange
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SavedLogsTab(
    astronautId: String,
    logs: List<DailyLogWithEntries>,
    unsyncedCount: Int,
    isSyncing: Boolean,
    onSyncNow: () -> Unit,
    onDeleteLog: (Long) -> Unit,
    onLogout: () -> Unit
) {
    Scaffold(
        contentWindowInsets = WindowInsets(0, 0, 0, 0),
        topBar = {
            TopAppBar(
                title = { Text("$astronautId Saved Logs (${logs.size})") },
                actions = {
                    TextButton(onClick = onLogout) { Text("Logout") }
                }
            )
        }
    ) { padding ->
        if (logs.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "No daily logs saved yet for $astronautId.\nComplete all measurements in Daily Check to save.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        } else {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
                    .padding(horizontal = 16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp),
                contentPadding = PaddingValues(vertical = 12.dp)
            ) {
                item {
                    Card(
                        colors = CardDefaults.cardColors(
                            containerColor = MaterialTheme.colorScheme.surfaceVariant
                        ),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(12.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = if (unsyncedCount > 0) "$unsyncedCount log(s) pending sync"
                                    else "Dashboard synced",
                                    style = MaterialTheme.typography.titleSmall,
                                    color = if (unsyncedCount > 0) CyanSecondary else SafeGreen
                                )
                                Text(
                                    text = "Web Dashboard Uplink",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }

                            Button(
                                onClick = onSyncNow,
                                enabled = !isSyncing && unsyncedCount > 0
                            ) {
                                if (isSyncing) {
                                    CircularProgressIndicator(
                                        modifier = Modifier.size(18.dp),
                                        color = MaterialTheme.colorScheme.onPrimary,
                                        strokeWidth = 2.dp
                                    )
                                } else {
                                    Text("Sync Now")
                                }
                            }
                        }
                    }
                }

                items(logs, key = { it.log.logId }) { record ->
                    SavedLogCard(
                        record = record,
                        onDelete = { onDeleteLog(record.log.logId) }
                    )
                }
            }
        }
    }
}

@Composable
private fun SavedLogCard(
    record: DailyLogWithEntries,
    onDelete: () -> Unit
) {
    var expanded by remember { mutableStateOf(false) }
    val passCount = record.entries.count { it.status == "WITHIN_RANGE" }
    val alertCount = record.entries.size - passCount
    val timeString = remember(record.log.createdAt) {
        SimpleDateFormat("hh:mm a", Locale.US).format(Date(record.log.createdAt))
    }
    val syncColor = if (record.log.isSyncedToServer) SafeGreen else WarningOrange
    val syncText = if (record.log.isSyncedToServer) "Synced" else "Pending"

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { expanded = !expanded },
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Text(
                            text = "${record.log.date} • $timeString",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold
                        )
                        Surface(
                            color = syncColor.copy(alpha = 0.16f),
                            shape = RoundedCornerShape(8.dp)
                        ) {
                            Text(
                                text = syncText,
                                color = syncColor,
                                style = MaterialTheme.typography.labelSmall,
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp)
                            )
                        }
                    }
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "$passCount Passed • $alertCount Out of Range (${record.entries.size} total)",
                        style = MaterialTheme.typography.bodySmall,
                        color = if (alertCount > 0) AlertRed else SafeGreen
                    )
                }

                IconButton(onClick = onDelete) {
                    Icon(
                        imageVector = Icons.Default.Delete,
                        contentDescription = "Delete log",
                        tint = MaterialTheme.colorScheme.error
                    )
                }

                Icon(
                    imageVector = if (expanded) Icons.Default.KeyboardArrowUp else Icons.Default.KeyboardArrowDown,
                    contentDescription = "Expand"
                )
            }

            if (expanded) {
                HorizontalDivider(modifier = Modifier.padding(vertical = 10.dp))
                record.entries.sortedBy { it.metricId }.forEach { entry ->
                    val statusColor = when (entry.status) {
                        "WITHIN_RANGE" -> SafeGreen
                        "TOO_LOW" -> AlertRed
                        else -> WarningOrange
                    }
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 4.dp),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            text = "${entry.metricId}. ${entry.metricName}",
                            style = MaterialTheme.typography.bodyMedium,
                            modifier = Modifier.weight(1f)
                        )
                        Text(
                            text = "${entry.measuredValue} ${entry.unit} (Base: ${entry.baselineValue})",
                            style = MaterialTheme.typography.bodySmall,
                            color = statusColor,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                }
            }
        }
    }
}