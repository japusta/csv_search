import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { SearchRepository } from './search.repository';
import { AuthGuard } from '../../security/auth.guard';

@Controller('search')
@UseGuards(AuthGuard)
export class SearchController {
  constructor(private readonly repo: SearchRepository) {}

  @Get()
  async search(
    @Query('datasetId') datasetId: string,
    @Query('field') field: string | string[],
    @Query('value') value: string | string[],
    @Query('mode') mode: 'and' | 'or' = 'and',
    @Query('page') page = '1',
    @Query('limit') limit = '100',
    @Query('sortField') sortField?: string,
    @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'asc',
  ) {
    const p = Number(page);
    const l = Number(limit);

    const fields = Array.isArray(field) ? field : field ? [field] : [];
    const values = Array.isArray(value) ? value : value ? [value] : [];

    const conditions = fields.map((f, i) => ({
      field: f,
      value: values[i] ?? '',
    }));

    const { items, total } = await this.repo.searchDatasetRows(
      datasetId,
      conditions.filter((c) => c.field && c.value),
      mode,
      p,
      l,
      sortField,
      sortOrder,
    );

    return {
      total,
      page: p,
      limit: l,
      items,
    };
  }
}
