package com.wallet.clover.api.endpoint

data class CreatePostRequest(
    val userId: Long,
    val title: String,
    val content: String,
)
