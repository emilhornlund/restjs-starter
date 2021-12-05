import { PaginationDto } from './pagination-dto';

export interface PageResultDto<T> {
  content: T[];
  page: PaginationDto;
}
