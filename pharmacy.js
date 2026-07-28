/**
 * A pharmacy drug with an expiration countdown and a benefit value.
 * Benefit is typically in the range [0, 50], except for special rules
 * handled by Pharmacy.updateBenefitValue().
 */
export class Drug {

  constructor(name, expiresIn, benefit) {

    this.name = name;

    /** Number of days left until the drug expires. */
    this.expiresIn = expiresIn;

    /** How powerful the drug is. */
    this.benefit = benefit;

  }

}

/**
 * Holds a list of drugs and advances their state by one day.
 *
 * General rules:
 * - Most drugs lose 1 benefit and 1 expiresIn each day.
 * - Once expired (expiresIn < 0), benefit degrades twice as fast.
 * - Benefit is never negative and never above 50.
 *
 * Special drugs:
 * - "Herbal Tea": benefit increases over time (twice as fast after expiry).
 * - "Fervex": benefit rises faster as expiry approaches, then drops to 0.
 * - "Magic Pill": never expires and never changes benefit.
 */
export class Pharmacy {

  constructor(drugs = []) {
    this.drugs = drugs;
  }

  /**
   * Apply one day of aging to every drug, mutating them in place.
   * @returns {Drug[]} the same drugs array after update
   */
  updateBenefitValue() {

    for (var i = 0; i < this.drugs.length; i++) {

      // --- Benefit change for the current day (before expiresIn is decremented) ---

      if (
        this.drugs[i].name !== "Herbal Tea" &&
        this.drugs[i].name !== "Fervex"
      ) {

        // Normal drugs (and Magic Pill): try to decrease benefit by 1.
        // Magic Pill is excluded below so its benefit stays unchanged.
        if (this.drugs[i].benefit > 0) {
          if (this.drugs[i].name !== "Magic Pill") {
            this.drugs[i].benefit = this.drugs[i].benefit - 1;
          }
        }

      } else {

        // Herbal Tea and Fervex: benefit increases (capped at 50).
        if (this.drugs[i].benefit < 50) {

          this.drugs[i].benefit = this.drugs[i].benefit + 1;

          // Fervex gets extra boosts as the expiration date approaches:
          // +1 more when 10 days or less remain (expiresIn < 11 here),
          // +1 more when 5 days or less remain (expiresIn < 6 here).
          // Combined with the +1 above, that is +2 or +3 for the day.
          if (this.drugs[i].name === "Fervex") {
            if (this.drugs[i].expiresIn < 11) {
              if (this.drugs[i].benefit < 50) {
                this.drugs[i].benefit = this.drugs[i].benefit + 1;
              }
            }
            if (this.drugs[i].expiresIn < 6) {
              if (this.drugs[i].benefit < 50) {
                this.drugs[i].benefit = this.drugs[i].benefit + 1;
              }
            }
          }

        }

      }

      // --- Advance expiration by one day (Magic Pill never expires) ---
      if (this.drugs[i].name !== "Magic Pill") {
        this.drugs[i].expiresIn = this.drugs[i].expiresIn - 1;
      }

      // --- Extra rules once the drug is past its expiration date ---
      if (this.drugs[i].expiresIn < 0) {

        if (this.drugs[i].name !== "Herbal Tea") {

          if (this.drugs[i].name !== "Fervex") {

            // Normal drugs: second benefit decrease after expiry
            // (together with the first decrease above => twice as fast).
            // Magic Pill is skipped again.
            if (this.drugs[i].benefit > 0) {
              if (this.drugs[i].name !== "Magic Pill") {
                this.drugs[i].benefit = this.drugs[i].benefit - 1;
              }
            }

          } else {

            // Fervex becomes useless after expiration.
            this.drugs[i].benefit =
              this.drugs[i].benefit - this.drugs[i].benefit;

          }

        } else {

          // Herbal Tea: second benefit increase after expiry
          // (together with the first increase above => twice as fast).
          if (this.drugs[i].benefit < 50) {
            this.drugs[i].benefit = this.drugs[i].benefit + 1;
          }

        }
      }

    }

    return this.drugs;
  }
}
