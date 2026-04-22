package com.taskmanagerapp.avatarview

import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.Typeface
import android.view.View

// Vista nativa de Android que dibuja un círculo de color con las iniciales del usuario.
// Todo se dibuja directamente en el Canvas — sin librerías externas
class AvatarNativeView(context: Context) : View(context) {

    private var initials: String = "?"
    private var backgroundColor: Int = Color.parseColor("#894fec") // color por defecto

    // Paint del círculo de fondo
    private val backgroundPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.FILL
    }

    // Paint del texto de las iniciales (blanco, centrado, negrita)
    private val textPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.WHITE
        textAlign = Paint.Align.CENTER
        typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
    }

    // React Native llama a este método cada vez que el prop `name` cambia
    fun setName(name: String) {
        initials = extractInitials(name)       // ej: "Alejandro Vitovis" → "AV"
        backgroundColor = nameToColor(name)    // ej: "Alejandro Vitovis" → azul único
        backgroundPaint.color = backgroundColor
        invalidate() // fuerza redibujar la vista con los nuevos valores
    }

    // Se ejecuta cada vez que la vista necesita dibujarse en pantalla
    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        val cx = width / 2f
        val cy = height / 2f
        val radius = minOf(cx, cy)

        // 1. Dibuja el círculo de color de fondo
        canvas.drawCircle(cx, cy, radius, backgroundPaint)

        // 2. Dibuja las iniciales centradas encima del círculo
        textPaint.textSize = radius * 0.76f // tamaño de fuente proporcional al círculo
        val textOffset = (textPaint.descent() + textPaint.ascent()) / 2f
        canvas.drawText(initials, cx, cy - textOffset, textPaint)
    }

    // Extrae la primera letra del primer y último nombre
    // ej: "Carlos Rivera" → "CR", "Pedro" → "P"
    private fun extractInitials(name: String): String {
        val trimmed = name.trim()
        if (trimmed.isEmpty()) return "?"
        val words = trimmed.split("\\s+".toRegex())
        return when {
            words.size == 1 -> words[0][0].uppercaseChar().toString()
            else -> "${words.first()[0].uppercaseChar()}${words.last()[0].uppercaseChar()}"
        }
    }

    // Mismo algoritmo que nameToColor en TypeScript:
    // convierte el nombre en un hash numérico → ángulo de color (0-360°)
    // mismo nombre = mismo color siempre, nombres distintos = colores distintos
    private fun nameToColor(name: String): Int {
        var hash = 0
        for (ch in name) {
            hash = ch.code + ((hash shl 5) - hash)
        }
        val hue = (Math.abs(hash) % 360).toFloat() // ej: 142° → verde
        return Color.HSVToColor(floatArrayOf(hue, 0.60f, 0.55f))
    }
}