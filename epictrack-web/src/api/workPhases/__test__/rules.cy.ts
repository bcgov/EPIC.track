import { WorkTypeEnum } from "api/workTypes/ids";
import { isOverageResponsibilityRequired } from "../rules";

describe("work phase rules", () => {
  it("requires an overage responsibility in legislated phases and amendment works", () => {
    const cases: [boolean, number | undefined, boolean][] = [
      [true, WorkTypeEnum.ASSESSMENT, true],
      [false, WorkTypeEnum.AMENDMENT, true],
      [false, WorkTypeEnum.JOINT_COMPLEX_AMENDMENT, true],
      [false, WorkTypeEnum.ASSESSMENT, false],
      [false, undefined, false],
    ];
    cases.forEach(([legislated, workTypeId, expected]) => {
      expect(
        isOverageResponsibilityRequired(legislated, workTypeId),
        `legislated=${legislated} workType=${workTypeId}`,
      ).to.equal(expected);
    });
  });
});
