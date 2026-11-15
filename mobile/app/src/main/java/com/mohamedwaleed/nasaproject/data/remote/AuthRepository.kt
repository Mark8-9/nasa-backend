package com.mohamedwaleed.nasaproject.data.remote

import com.google.firebase.auth.FirebaseAuth
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.tasks.await

class AuthRepository(
    private val auth: FirebaseAuth = FirebaseAuth.getInstance()
) {
    private val validAstronautIds = setOf("C001", "C002", "C003", "C004")

    fun getCurrentAstronautId(): String? {
        val email = auth.currentUser?.email ?: return null
        return email.substringBefore("@").uppercase()
    }

    fun observeAuthAstronautId(): Flow<String?> = callbackFlow {
        val listener = FirebaseAuth.AuthStateListener { firebaseAuth ->
            val id = firebaseAuth.currentUser?.email?.substringBefore("@")?.uppercase()
            trySend(id)
        }
        auth.addAuthStateListener(listener)
        awaitClose { auth.removeAuthStateListener(listener) }
    }

    suspend fun login(rawUserId: String, password: String): Result<String> {
        val normalizedId = rawUserId.trim().uppercase()
        if (normalizedId !in validAstronautIds) {
            return Result.failure(IllegalArgumentException("Invalid Astronaut ID. Use C001–C004."))
        }
        if (password.isBlank()) {
            return Result.failure(IllegalArgumentException("Please enter your password."))
        }

        return try {
            val email = "${normalizedId.lowercase()}@nasaproject.app"
            auth.signInWithEmailAndPassword(email, password).await()
            Result.success(normalizedId)
        } catch (e: Exception) {
            Result.failure(Exception("Authentication failed. Check your ID and password."))
        }
    }

    fun logout() {
        auth.signOut()
    }
}