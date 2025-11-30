package com.wallet.clover.api.dto

abstract class UpdatePost {
    data class Request(
        /** 게시글 내용 */
        val content: String?
    )
}
