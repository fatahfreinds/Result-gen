import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePositionInput } from './dto/create-position.input';
import { UpdatePositionInput } from './dto/update-position.input';
import { Position } from './entities/position.entity';
import { fieldsIdChecker, fieldsValidator } from 'src/utill/util';

@Injectable()
export class PositionService {
  constructor(@InjectRepository(Position) private positionRepository: Repository<Position>) {}

  create(createPositionInput: CreatePositionInput) {
    try {
      const newPositionInput = this.positionRepository.create(createPositionInput);
      return this.positionRepository.save(newPositionInput);
    } catch (e) {
      throw new HttpException(
        'An Error have when inserting position ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: e },
      );
    }
  }

  async findAll(fields: string[]) {
    const allowedRelations = [
      'candidateProgramme',
      'candidateProgramme.candidate',
      'candidateProgramme.programme',
    ];

    // validating fields
    fields = fieldsValidator(fields, allowedRelations);
    // checking if fields contains id
    fields = fieldsIdChecker(fields);

    try {
      const queryBuilder = this.positionRepository
        .createQueryBuilder('position')
        .leftJoinAndSelect('position.candidateProgramme', 'candidateProgramme')
        .leftJoinAndSelect('candidateProgramme.candidate', 'candidate')
        .leftJoinAndSelect('candidateProgramme.programme', 'programme');

      queryBuilder.select(
        fields.map(column => {
          const splitted = column.split('.');

          if (splitted.length > 1) {
            return `${splitted[splitted.length - 2]}.${splitted[splitted.length - 1]}`;
          } else {
            return `position.${column}`;
          }
        }),
      );
      const position = await queryBuilder.getMany();
      return position;
    } catch (e) {
      throw new HttpException(
        'An Error have when finding position ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: e },
      );
    }
  }

  async findOne(id: number, fields: string[]) {
    const allowedRelations = [
      'candidateProgramme',
      'candidateProgramme.candidate',
      'candidateProgramme.programme',
    ];

    // validating fields
    fields = fieldsValidator(fields, allowedRelations);
    // checking if fields contains id
    fields = fieldsIdChecker(fields);

    try {
      const queryBuilder = this.positionRepository
        .createQueryBuilder('position')
        .leftJoinAndSelect('position.candidateProgramme', 'candidateProgramme')
        .leftJoinAndSelect('candidateProgramme.candidate', 'candidate')
        .leftJoinAndSelect('candidateProgramme.programme', 'programme');

      queryBuilder.select(
        fields.map(column => {
          const splitted = column.split('.');

          if (splitted.length > 1) {
            return `${splitted[splitted.length - 2]}.${splitted[splitted.length - 1]}`;
          } else {
            return `position.${column}`;
          }
        }),
      );
      const position = await queryBuilder.getOne();
      return position;
    } catch (e) {
      throw new HttpException(
        'An Error have when finding position ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: e },
      );
    }
  }

  async update(id: number, updatePositionInput: UpdatePositionInput) {
    // checking is position exist
    const position = await this.positionRepository.findOneBy({ id });

    if (!position) {
      throw new HttpException(`Cant find a position `, HttpStatus.BAD_REQUEST);
    }
    // trying to return position

    try {
      return this.positionRepository.update(id, updatePositionInput);
    } catch (e) {
      throw new HttpException(
        'An Error have when updating position ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: e },
      );
    }
  }

  async remove(id: number) {
    // checking is position exist
    const position = await this.positionRepository.findOneBy({ id });

    if (!position) {
      throw new HttpException(`Cant find a position `, HttpStatus.BAD_REQUEST);
    }
    // trying to return position

    try {
      return this.positionRepository.delete(id);
    } catch (e) {
      throw new HttpException(
        'An Error have when deleting position ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: e },
      );
    }
  }
}
