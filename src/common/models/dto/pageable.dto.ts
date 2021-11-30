import { PageDto } from './page-dto.interface';

export interface PageableDto<T> {
  content: T[];
  page: PageDto;
}
