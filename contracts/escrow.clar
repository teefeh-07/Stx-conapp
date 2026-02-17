
;; Escrow Contract
;; A simple data storage contract for demonstration
;; Clarity Version: 4

(define-data-var escrow-amount uint u0)

(define-read-only (get-escrow-amount)
    (ok (var-get escrow-amount))
)

(define-public (add-amount (amount uint))
    (begin
        (var-set escrow-amount (+ (var-get escrow-amount) amount))
        (ok true)
    )
)
