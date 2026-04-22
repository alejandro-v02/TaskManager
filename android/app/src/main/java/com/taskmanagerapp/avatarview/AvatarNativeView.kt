package com.taskmanagerapp.avatarview

import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.Typeface
import android.view.View

/**
 * Custom Android View that renders a circular avatar with initials.
 * The circle color is derived deterministically from the user's name.
 * The initials are extracted from the name and rendered in white on the circle.
 *
 * All rendering is done natively on a Canvas — no Compose or Glide dependencies.
 */
class AvatarNativeView(context: Context) : View(context) {

    private var initials: String = "?"
    private var backgroundColor: Int = Color.parseColor("#7C3AED")

    private val backgroundPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.FILL
    }

    private val textPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.WHITE
        textAlign = Paint.Align.CENTER
        typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
    }

    /**
     * Called by AvatarViewManager when the `name` React prop changes.
     */
    fun setName(name: String) {
        initials = extractInitials(name)
        backgroundColor = nameToColor(name)
        backgroundPaint.color = backgroundColor
        invalidate() // triggers re-draw
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        val cx = width / 2f
        val cy = height / 2f
        val radius = minOf(cx, cy)

        // Draw circular background
        canvas.drawCircle(cx, cy, radius, backgroundPaint)

        // Draw initials — font size ≈ 38% of diameter
        textPaint.textSize = radius * 0.76f
        val textOffset = (textPaint.descent() + textPaint.ascent()) / 2f
        canvas.drawText(initials, cx, cy - textOffset, textPaint)
    }

    // ─── Pure helpers ─────────────────────────────────────────────────────────

    private fun extractInitials(name: String): String {
        val trimmed = name.trim()
        if (trimmed.isEmpty()) return "?"
        val words = trimmed.split("\\s+".toRegex())
        return when {
            words.size == 1 -> words[0][0].uppercaseChar().toString()
            else -> "${words.first()[0].uppercaseChar()}${words.last()[0].uppercaseChar()}"
        }
    }

    private fun nameToColor(name: String): Int {
        var hash = 0
        for (ch in name) {
            hash = ch.code + ((hash shl 5) - hash)
        }
        val hue = (Math.abs(hash) % 360).toFloat()
        // HSV: hue degrees, 60% saturation, 45% value
        return Color.HSVToColor(floatArrayOf(hue, 0.60f, 0.55f))
    }
}
