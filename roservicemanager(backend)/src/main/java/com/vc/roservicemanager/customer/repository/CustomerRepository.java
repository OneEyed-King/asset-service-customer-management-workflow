package com.vc.roservicemanager.customer.repository;

import com.vc.roservicemanager.customer.entity.Customer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CustomerRepository
        extends JpaRepository<Customer, UUID> {

    Optional<Customer> findByIdAndActiveTrue(UUID id);

    Page<Customer> findByActiveTrue(Pageable pageable);

    @Query(
            value = """
                    SELECT *
                    FROM customers
                    WHERE active = true
                      AND (
                            name ILIKE CONCAT('%', :search, '%')
                            OR contact_number LIKE CONCAT('%', :search, '%')
                      )
                    ORDER BY name
                    """,
            countQuery = """
                    SELECT COUNT(*)
                    FROM customers
                    WHERE active = true
                      AND (
                            name ILIKE CONCAT('%', :search, '%')
                            OR contact_number LIKE CONCAT('%', :search, '%')
                      )
                    """,
            nativeQuery = true
    )
    Page<Customer> searchCustomers(
            @Param("search") String search,
            Pageable pageable
    );

    @Query(
            value = """
                    SELECT *
                    FROM customers
                    WHERE active = true
                      AND (
                            name ILIKE CONCAT('%', :search, '%')
                            OR contact_number LIKE CONCAT('%', :search, '%')
                      )
                    ORDER BY name
                    LIMIT :limit
                    """,
            nativeQuery = true
    )
    List<Customer> autoComplete(
            @Param("search") String search,
            @Param("limit") int limit
    );


}
