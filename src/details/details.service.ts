import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDetailInput } from './dto/create-detail.input';
import { UpdateDetailInput } from './dto/update-detail.input';
import { Detail } from './entities/detail.entity';
import { fieldsIdChecker, fieldsValidator } from 'src/utill/util';

@Injectable()
export class DetailsService {
  constructor(@InjectRepository(Detail) private detailRepository: Repository<Detail>) {}

  async create(createDetailInput: CreateDetailInput) {
    // it can have only one row

    // check how many row are there currently
    const count: number = await this.detailRepository.count();
    if (count > 1) {
      // if there is already a row, update it
      return this.detailRepository.update(1, createDetailInput);
    }

    // create a new row
    try {
      const newDetailInput = this.detailRepository.create(createDetailInput);
      return this.detailRepository.save(newDetailInput);
    } catch (e) {
      throw new HttpException(
        'An Error have when inserting data ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: e },
      );
    }
  }

  async find(fields: string[]) {
    const allowedRelations = [];

    // validating fields
    fields = fieldsValidator(fields, allowedRelations);
    // checking if fields contains id
    fields = fieldsIdChecker(fields);

    try {
      const queryBuilder = this.detailRepository.createQueryBuilder('detail');

      queryBuilder.select(
        fields.map(column => {
          const splitted = column.split('.');

          if (splitted.length > 1) {
            return `${splitted[splitted.length - 2]}.${splitted[splitted.length - 1]}`;
          } else {
            return `detail.${column}`;
          }
        }),
      );
      const detail = await queryBuilder.getOne();
      return detail;
    } catch (e) {
      throw new HttpException(
        'An Error have when finding detail ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: e },
      );
    }
  }

  findIt() {
    try {
      return this.detailRepository.find()[0];
    } catch (e) {
      throw new HttpException(
        'An Error have when finding data ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: e },
      );
    }
  }

  update(id: number = 1, updateDetailInput: UpdateDetailInput) {
    try {
      return this.detailRepository.update(id, updateDetailInput);
    } catch (e) {
      throw new HttpException(
        'An Error have when updating data ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: e },
      );
    }
  }

  async ReadyToResult() {
    try {
      const detail = await this.detailRepository.findOneBy({ id: 1 });

      if (detail) {
        return new HttpException(
          'An Error have when finding data ',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      detail.isResultReady = true;

      return this.detailRepository.save(detail);
    } catch (e) {
      throw new HttpException(
        'An Error have when finding data ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: e },
      );
    }
  }
}
