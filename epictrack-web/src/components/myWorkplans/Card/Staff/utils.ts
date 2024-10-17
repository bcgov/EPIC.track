export const sortTeam = (staff_info: any[], email: string) => {
  let userIndex = -1;
  staff_info.map((staffObject: any, index: number) => {
    const staff = staffObject.staff;
    if (staff.email === email) {
      userIndex = index;
    }
  });
  if (userIndex >= 0) {
    [staff_info[0], staff_info[userIndex]] = [
      staff_info[userIndex],
      staff_info[0],
    ];
  }
  return staff_info;
};
