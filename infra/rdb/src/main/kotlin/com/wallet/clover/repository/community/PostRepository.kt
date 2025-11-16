package com.wallet.clover.repository.community

import com.wallet.clover.entity.community.PostEntity
import org.springframework.data.jpa.repository.JpaRepository

interface PostRepository : JpaRepository<PostEntity, Long>
