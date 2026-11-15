package com.mohamedwaleed.nasaproject.ui.theme

import android.app.Activity
import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.shape.CutCornerShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Shapes
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalView
import androidx.compose.ui.unit.dp
import androidx.core.view.WindowCompat

private val TacticalDarkColorScheme = darkColorScheme(
    primary = NeonGreenPrimary,
    onPrimary = DeepSpaceBackground,
    primaryContainer = NeonGreenContainer,
    onPrimaryContainer = NeonGreenPrimary,
    secondary = CyanSecondary,
    onSecondary = DeepSpaceBackground,
    secondaryContainer = CyanContainer,
    onSecondaryContainer = CyanSecondary,
    tertiary = BabyBlueTertiary,
    onTertiary = TextWhite,
    background = DeepSpaceBackground,
    onBackground = TextWhite,
    surface = SurfacePanel,
    onSurface = TextWhite,
    surfaceVariant = SurfacePanelLighter,
    onSurfaceVariant = TextGrey,
    surfaceContainer = SurfacePanel,
    surfaceContainerHigh = SurfacePanelLighter,
    outline = OutlineSubtle,
    outlineVariant = SurfacePanelLighter,
    error = AlertRed,
    onError = TextWhite
)

val TacticalShapes = Shapes(
    small = RoundedCornerShape(4.dp), // Slight rounding for small tags
    medium = CutCornerShape(topEnd = 12.dp, bottomStart = 12.dp), // Sci-fi cut corners for cards
    large = CutCornerShape(topEnd = 16.dp, bottomStart = 16.dp) // Cut corners for main buttons
)

@Composable
fun NasaHealthAppTheme(
    content: @Composable () -> Unit
) {
    val colorScheme = TacticalDarkColorScheme
    val view = LocalView.current

    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = colorScheme.background.toArgb()
            window.navigationBarColor = colorScheme.surface.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = false
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        shapes = TacticalShapes,
        content = content
    )
}