import FilterSelect from '../../shared/filterSelect/FilterSelect';

export const TeamFilter = () => {
  return (
    
    <FilterSelect
    options={[]}
    variant="inline"
    placeholder="Team"
    filterAppliedCallback={() => {
      return;
    }}
        name="team"
    isMulti
    info={true}
  />
  )
}
