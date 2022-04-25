import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { ServiceHelper } from '../../common/helpers/module/service.helper';

import { Notes } from './notes.entity';

@Injectable()
export class NotesService extends ServiceHelper<Notes> {
  constructor(
    @InjectRepository(Notes)
    notesRepository: Repository<Notes>,
  ) {
    super(notesRepository);
  }
}
