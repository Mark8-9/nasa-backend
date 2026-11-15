package com.mohamedwaleed.nasaproject.ui.theme

import androidx.compose.material3.Typography
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp
import com.mohamedwaleed.nasaproject.R

val SpaceTechFont = FontFamily(
    Font(R.font.spacemono_regular, FontWeight.Normal),
    Font(R.font.spacemono_bold, FontWeight.Bold)
)
val Typography = Typography(
    // Login Portal Title
    headlineSmall = TextStyle(
        fontFamily = SpaceTechFont,
        fontWeight = FontWeight.Bold,
        fontSize = 22.sp,
        lineHeight = 28.sp,
        letterSpacing = 1.2.sp
    ),
    // TopAppBar & Summary Stat Numbers
    titleLarge = TextStyle(
        fontFamily = SpaceTechFont,
        fontWeight = FontWeight.Bold,
        fontSize = 19.sp,
        lineHeight = 24.sp,
        letterSpacing = 1.sp
    ),
    // Card Titles & Log Headers
    titleMedium = TextStyle(
        fontFamily = SpaceTechFont,
        fontWeight = FontWeight.Bold,
        fontSize = 15.sp,
        lineHeight = 20.sp,
        letterSpacing = 0.6.sp
    ),
    // Baseline Row Titles
    titleSmall = TextStyle(
        fontFamily = SpaceTechFont,
        fontWeight = FontWeight.Bold,
        fontSize = 14.sp,
        lineHeight = 18.sp,
        letterSpacing = 0.4.sp
    ),
    // Input Field Text
    bodyLarge = TextStyle(
        fontFamily = SpaceTechFont,
        fontWeight = FontWeight.Normal,
        fontSize = 15.sp,
        lineHeight = 22.sp
    ),
    // Standard Body Text
    bodyMedium = TextStyle(
        fontFamily = SpaceTechFont,
        fontWeight = FontWeight.Normal,
        fontSize = 13.sp,
        lineHeight = 18.sp
    ),
    // Secondary Metadata (Baselines, Ranges, Subtitles)
    bodySmall = TextStyle(
        fontFamily = SpaceTechFont,
        fontWeight = FontWeight.Normal,
        fontSize = 12.sp,
        lineHeight = 16.sp
    ),
    // Buttons, TextButtons & FilterChips (color adapts automatically to surface)
    labelLarge = TextStyle(
        fontFamily = SpaceTechFont,
        fontWeight = FontWeight.Bold,
        fontSize = 13.sp,
        lineHeight = 18.sp,
        letterSpacing = 1.sp
    ),
    // Status Badges & Bottom Nav Labels
    labelMedium = TextStyle(
        fontFamily = SpaceTechFont,
        fontWeight = FontWeight.Bold,
        fontSize = 11.sp,
        lineHeight = 14.sp,
        letterSpacing = 0.5.sp
    ),
    // Small Data Labels
    labelSmall = TextStyle(
        fontFamily = SpaceTechFont,
        fontWeight = FontWeight.Normal,
        fontSize = 10.sp,
        lineHeight = 14.sp,
        letterSpacing = 0.5.sp
    )
)