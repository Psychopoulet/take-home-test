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
