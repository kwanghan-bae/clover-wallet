package com.wallet.clover.api.endpoint

data class CreateCommentRequest(
    val postId: Long,
    val userId: Long,
    val content: String,
)
