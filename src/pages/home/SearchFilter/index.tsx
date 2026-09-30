import styles from './index.module.scss';

export interface FilterTag {
  value: string;
  label: string;
}

interface SearchFilterProps {
  tags: FilterTag[];
  selectedTags: string[];
  query: string;
  onTagsChange: (tags: string[]) => void;
  onQueryChange: (query: string) => void;
}

export function SearchFilter({ tags, selectedTags, query, onTagsChange, onQueryChange }: SearchFilterProps) {
  const options = [{ label: '全部', value: '' }, ...tags];

  const toggleTag = (tag: FilterTag) => {
    if (!tag.value) {
      onTagsChange([]);
      return;
    }

    onTagsChange(
      selectedTags.includes(tag.value)
        ? selectedTags.filter((value) => value !== tag.value)
        : [...selectedTags, tag.value],
    );
  };

  return (
    <div className={styles['search-filter']}>
      <div className={styles['filter-panel']} role="region" aria-label="文章筛选">
        <div className={styles['filter-row']} role="group" aria-label="按标签筛选文章">
          <div className={styles['filter-options']}>
            {options.map((option, index) => {
              const isSelected = option.value
                ? selectedTags.includes(option.value)
                : selectedTags.length === 0;
              return (
                <button
                  key={option.value}
                  className={`${styles['filter-option']} ${isSelected ? styles['filter-option-selected'] : ''}`}
                  style={{ animationDelay: `${Math.min(index, 10) * 18}ms` }}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => toggleTag(option)}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchFilter;