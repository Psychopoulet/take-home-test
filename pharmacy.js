import { Drug } from "./drug.js";
export { Drug };

const MIN_BENEFIT = 0;
const MAX_BENEFIT = 50;

const HERBAL_TEA = "Herbal Tea";
const FERVEX = "Fervex";
const MAGIC_PILL = "Magic Pill";

/** PRIVATE HELPERS */

// splitted for readability and maintainability

/** Decrease benefit without going below 0. */
function _decreaseBenefit(drug, amount = 1) {
  drug.benefit = Math.max(MIN_BENEFIT, drug.benefit - amount);
}

/** Increase benefit without going above 50. */
function _increaseBenefit(drug, amount = 1) {
  drug.benefit = Math.min(MAX_BENEFIT, drug.benefit + amount);
}

/** Advance expiration by one day. */
function _decreaseExpiresIn(drug) {
  drug.expiresIn -= 1;
}

/**
 * Normal drugs: lose 1 benefit and 1 expiresIn each day.
 * After expiration, benefit degrades twice as fast.
 */
function _updateNormal(drug) {

  _decreaseBenefit(drug);
  _decreaseExpiresIn(drug);

  if (drug.expiresIn < 0) {
    _decreaseBenefit(drug);
  }

}

/**
 * Herbal Tea: benefit increases over time (twice as fast after expiry).
 */
function _updateHerbalTea(drug) {

  _increaseBenefit(drug);
  _decreaseExpiresIn(drug);

  if (drug.expiresIn < 0) {
    _increaseBenefit(drug);
  }

}

/**
 * Fervex: benefit rises faster as expiry approaches, then drops to 0.
 * +1 by default, +2 when 10 days or less remain, +3 when 5 days or less.
 */
function _updateFervex(drug) {

  _increaseBenefit(drug);

  // Extra boosts are evaluated before expiresIn is decremented.
  if (drug.expiresIn < 11) {
    _increaseBenefit(drug);
  }

  if (drug.expiresIn < 6) {
    _increaseBenefit(drug);
  }

  _decreaseExpiresIn(drug);

  if (drug.expiresIn < 0) {
    drug.benefit = 0;
  }

}

/**
 * Magic Pill: never expires and never changes benefit.
 */
function _updateMagicPill() {
  // no-op
}

/** Dispatch table: drug name → private update rule. */
const UPDATERS = {
  [HERBAL_TEA]: _updateHerbalTea,
  [FERVEX]: _updateFervex,
  [MAGIC_PILL]: _updateMagicPill,
};

/** END PRIVATE HELPERS */

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
      const update = UPDATERS[drug.name] ?? _updateNormal;
      update(drug);
    }

    return this.drugs;

  }

}
