import { WorkTypeEnum } from "api/workTypes/ids";
import { defaultReportDescription } from "../rules";

describe("work type rules", () => {
  it("gives a new work its type's report description", () => {
    expect(defaultReportDescription(WorkTypeEnum.ASSESSMENT)).to.equal(
      "On [date], [initiator] entered the environmental assessment process.",
    );
    const amendment = defaultReportDescription(WorkTypeEnum.AMENDMENT);
    expect(amendment).to.match(
      /^\[Certificate Holder\/Ministry\] is proposing/,
    );
    expect(
      defaultReportDescription(WorkTypeEnum.JOINT_COMPLEX_AMENDMENT),
    ).to.equal(amendment);
  });

  it("has no description for types without one, or unknown ids", () => {
    [WorkTypeEnum.INTAKE_PRE_EA, WorkTypeEnum.OTHER, 999].forEach((id) => {
      expect(defaultReportDescription(id), `workType=${id}`).to.equal(
        undefined,
      );
    });
  });
});
