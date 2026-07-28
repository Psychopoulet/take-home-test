// deps

  // natives
  import { readFile } from "node:fs/promises";
  import { join } from "node:path";

  // locals
  import { Drug, Pharmacy } from "./pharmacy";

// tests

describe("Pharmacy", () => {

  // historical test, to ensure the nominal behavior is working
  it("should decrease the benefit and expiresIn", () => {
    expect(new Pharmacy([new Drug("test", 2, 3)]).updateBenefitValue()).toEqual(
      [new Drug("test", 1, 2)],
    );
  });

  describe("generic drug", () => {
    it("should decrease the benefit and expiresIn", () => {
      expect(
        new Pharmacy([new Drug("test", 2, 3)]).updateBenefitValue(),
      ).toEqual([new Drug("test", 1, 2)]);
    });

    it("should degrade benefit twice as fast after expiration", () => {
      expect(
        new Pharmacy([new Drug("test", 0, 10)]).updateBenefitValue(),
      ).toEqual([new Drug("test", -1, 8)]);
    });

    it("should never make benefit negative", () => {
      expect(
        new Pharmacy([new Drug("test", 5, 0)]).updateBenefitValue(),
      ).toEqual([new Drug("test", 4, 0)]);
    });

    it("should never make benefit negative after expiration", () => {
      expect(
        new Pharmacy([new Drug("test", 0, 1)]).updateBenefitValue(),
      ).toEqual([new Drug("test", -1, 0)]);
    });
  });

  describe("Herbal Tea", () => {
    it("should increase benefit and decrease expiresIn", () => {
      expect(
        new Pharmacy([new Drug("Herbal Tea", 10, 5)]).updateBenefitValue(),
      ).toEqual([new Drug("Herbal Tea", 9, 6)]);
    });

    it("should increase benefit twice as fast after expiration", () => {
      expect(
        new Pharmacy([new Drug("Herbal Tea", 0, 5)]).updateBenefitValue(),
      ).toEqual([new Drug("Herbal Tea", -1, 7)]);
    });

    it("should never increase benefit above 50", () => {
      expect(
        new Pharmacy([new Drug("Herbal Tea", 10, 50)]).updateBenefitValue(),
      ).toEqual([new Drug("Herbal Tea", 9, 50)]);
    });

    it("should never increase benefit above 50 after expiration", () => {
      expect(
        new Pharmacy([new Drug("Herbal Tea", 0, 49)]).updateBenefitValue(),
      ).toEqual([new Drug("Herbal Tea", -1, 50)]);
    });
  });

  describe("Fervex", () => {
    it("should increase benefit by 1 when expiresIn is above 10", () => {
      expect(
        new Pharmacy([new Drug("Fervex", 12, 20)]).updateBenefitValue(),
      ).toEqual([new Drug("Fervex", 11, 21)]);
    });

    it("should increase benefit by 2 when expiresIn is 10 or less", () => {
      expect(
        new Pharmacy([new Drug("Fervex", 10, 20)]).updateBenefitValue(),
      ).toEqual([new Drug("Fervex", 9, 22)]);
    });

    it("should increase benefit by 3 when expiresIn is 5 or less", () => {
      expect(
        new Pharmacy([new Drug("Fervex", 5, 20)]).updateBenefitValue(),
      ).toEqual([new Drug("Fervex", 4, 23)]);
    });

    it("should drop benefit to 0 after expiration", () => {
      expect(
        new Pharmacy([new Drug("Fervex", 0, 20)]).updateBenefitValue(),
      ).toEqual([new Drug("Fervex", -1, 0)]);
    });

    it("should never increase benefit above 50", () => {
      expect(
        new Pharmacy([new Drug("Fervex", 5, 49)]).updateBenefitValue(),
      ).toEqual([new Drug("Fervex", 4, 50)]);
    });
  });

  describe("Magic Pill", () => {
    it("should never expire nor decrease in benefit", () => {
      expect(
        new Pharmacy([new Drug("Magic Pill", 15, 40)]).updateBenefitValue(),
      ).toEqual([new Drug("Magic Pill", 15, 40)]);
    });
  });

  describe("Dafalgan", () => {
    it("should degrade benefit twice as fast as normal drugs", () => {
      expect(
        new Pharmacy([new Drug("Dafalgan", 10, 20)]).updateBenefitValue(),
      ).toEqual([new Drug("Dafalgan", 9, 18)]);
    });

    it("should degrade benefit by 4 after expiration", () => {
      expect(
        new Pharmacy([new Drug("Dafalgan", 0, 20)]).updateBenefitValue(),
      ).toEqual([new Drug("Dafalgan", -1, 16)]);
    });

    it("should never make benefit negative", () => {
      expect(
        new Pharmacy([new Drug("Dafalgan", 5, 1)]).updateBenefitValue(),
      ).toEqual([new Drug("Dafalgan", 4, 0)]);
    });

    it("should never make benefit negative after expiration", () => {
      expect(
        new Pharmacy([new Drug("Dafalgan", 0, 3)]).updateBenefitValue(),
      ).toEqual([new Drug("Dafalgan", -1, 0)]);
    });
  });

  describe("30-day simulation regression", () => {

    it("should match output.json", async () => {

      const drugs = [
        new Drug("Doliprane", 20, 30),
        new Drug("Herbal Tea", 10, 5),
        new Drug("Fervex", 12, 35),
        new Drug("Magic Pill", 15, 40),
      ];
      const pharmacy = new Pharmacy(drugs);
      const log = [];

      for (let elapsedDays = 0; elapsedDays < 30; elapsedDays++) {
        log.push(JSON.parse(JSON.stringify(pharmacy.updateBenefitValue())));
      }

      const expected = JSON.parse(
        await readFile(join(__dirname, "output.json"), "utf8")
      );

      expect({ result: log }).toEqual(expected);

    });

  });

});
