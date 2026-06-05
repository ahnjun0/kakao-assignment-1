/* FilterTabs — 전체 / 진행 중 / 완료 탭.
 * 1차 .filter-bar 와 동일한 룩: 세 버튼 균등 분할, 활성 탭은 primary-soft 배경 + primary 글자.
 * - currentFilter: 'all' | 'active' | 'done'
 * - onFilterChange(filter): 탭 클릭 시 부모에게 알림 */

const FILTERS = [
  { key: 'all', label: '전체' },
  { key: 'active', label: '진행 중' },
  { key: 'done', label: '완료' },
]

function FilterTabs({ currentFilter, onFilterChange }) {
  return (
    <nav className="flex gap-2 mb-4" role="tablist">
      {FILTERS.map((filter) => {
        const isSelected = filter.key === currentFilter
        // 활성/비활성 클래스를 분리해서 가독성을 높인다.
        const base =
          'flex-1 py-2 text-sm rounded-md border transition-colors'
        const inactive =
          'bg-surface text-muted border-border font-medium hover:text-primary'
        const active =
          'bg-primary-soft text-primary border-primary font-semibold'
        return (
          <button
            key={filter.key}
            type="button"
            role="tab"
            aria-selected={isSelected}
            onClick={() => onFilterChange(filter.key)}
            className={`${base} ${isSelected ? active : inactive}`}
          >
            {filter.label}
          </button>
        )
      })}
    </nav>
  )
}

export default FilterTabs
