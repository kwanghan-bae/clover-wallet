package com.wallet.clover.entity.lottospot

import com.wallet.clover.entity.BaseEntity
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Table

@Entity
@Table(name = "lotto_spot")
class LottoSpotEntity(
    var name: String,
    var address: String,
    var latitude: Double,
    var longitude: Double,

    @Column(name = "first_place_wins")
    var firstPlaceWins: Int,

    @Column(name = "second_place_wins")
    var secondPlaceWins: Int,
) : BaseEntity() {
    // Default constructor for JPA
    constructor() : this("", "", 0.0, 0.0, 0, 0)
}
