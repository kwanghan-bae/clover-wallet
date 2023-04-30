package com.wallet.clover.domain

enum class YesNo {
    Y,
    N;

    fun isYes() = this == Y

    fun isNo() = this == N
}
