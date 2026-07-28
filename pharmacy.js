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

const BENEFITS_INCREASE_INSTEAD_OF_DECREASE = ["Herbal Tea", "Fervex"];

const MIN_BENEFIT = 0;
const MAX_BENEFIT = 50;
const MAGIC_PILL = "Magic Pill";

/** Decrease benefit without going below 0. */
function decreaseBenefit(drug, amount = 1) {
  drug.benefit = Math.max(MIN_BENEFIT, drug.benefit - amount);
}

/** Increase benefit without going above 50. */
function increaseBenefit(drug, amount = 1) {
  drug.benefit = Math.min(MAX_BENEFIT, drug.benefit + amount);
}

/** Advance expiration by one day, unless the drug never expires. */
function decreaseExpiresIn(drug) {
  if (drug.name !== MAGIC_PILL) {
    drug.expiresIn -= 1;
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

    for (const drug of this.drugs) {

      // --- Benefit change for the current day (before expiresIn is decremented) ---

      if (!BENEFITS_INCREASE_INSTEAD_OF_DECREASE.includes(drug.name)) {

        // Normal drugs (and Magic Pill): try to decrease benefit by 1.
        // Magic Pill is excluded so its benefit stays unchanged.
        if (drug.name !== MAGIC_PILL) {
          decreaseBenefit(drug);
        }

      } else {

        // Herbal Tea and Fervex: benefit increases (capped at 50).
        increaseBenefit(drug);

        // Fervex gets extra boosts as the expiration date approaches:
        // +1 more when 10 days or less remain (expiresIn < 11 here),
        // +1 more when 5 days or less remain (expiresIn < 6 here).
        // Combined with the +1 above, that is +2 or +3 for the day.
        if (drug.name === "Fervex") {

          if (drug.expiresIn < 11) {
            increaseBenefit(drug);
          }

          if (drug.expiresIn < 6) {
            increaseBenefit(drug);
          }

        }

      }

      // --- Advance expiration by one day (Magic Pill never expires) ---
      decreaseExpiresIn(drug);

      // --- Extra rules once the drug is past its expiration date ---
      if (drug.expiresIn < 0) {

        if (drug.name !== "Herbal Tea") {

          if (drug.name !== "Fervex") {

            // Normal drugs: second benefit decrease after expiry
            // (together with the first decrease above => twice as fast).
            // Magic Pill is skipped again.
            if (drug.name !== MAGIC_PILL) {
              decreaseBenefit(drug);
            }

          } else {

            // Fervex becomes useless after expiration.
            drug.benefit = 0;

          }

        } else {

          // Herbal Tea: second benefit increase after expiry
          // (together with the first increase above => twice as fast).
          increaseBenefit(drug);

        }

      }

    }

    return this.drugs;

  }

}
