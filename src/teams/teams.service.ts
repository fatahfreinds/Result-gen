import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTeamInput } from './dto/create-team.input';
import { UpdateTeamInput } from './dto/update-team.input';
import { Team } from './entities/team.entity';
import { fieldsIdChecker, fieldsValidator } from 'src/utill/util';

@Injectable()
export class TeamsService {
  constructor(@InjectRepository(Team) private teamRepository: Repository<Team>) {}

  create(createTeamInput: CreateTeamInput) {
    try {
      const newTeamInput = this.teamRepository.create(createTeamInput);
      return this.teamRepository.save(newTeamInput);
    } catch (e) {
      throw new HttpException(
        'An Error have when creating team ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: e },
      );
    }
  }

  async findAll(fields: string[]) {
    const allowedRelations = [
      'candidates',
      'candidates.candidateProgrammes',
      'candidates.category',
      'candidates.candidateProgrammes.programme',
    ];

    // any field that contains . as relation and not in the list will removed from the list
    fields = fieldsValidator(fields, allowedRelations);

    fields = fieldsIdChecker(fields);

    try {
      const queryBuilder = this.teamRepository
        .createQueryBuilder('team')
        .leftJoinAndSelect('team.candidates', 'candidates')
        .leftJoinAndSelect('candidates.candidateProgrammes', 'candidateProgrammes')
        .leftJoinAndSelect('candidates.category', 'category')
        .leftJoinAndSelect('candidateProgrammes.programme', 'programme')
        .orderBy('team.name', 'ASC');

      queryBuilder.select(
        fields.map(column => {
          const splitted = column.split('.');

          if (splitted.length > 1) {
            return `${splitted[splitted.length - 2]}.${splitted[splitted.length - 1]}`;
          } else {
            return `team.${column}`;
          }
        }),
      );

      const team = await queryBuilder.getMany();
      return team;
    } catch (e) {
      throw new HttpException(
        'An Error have when finding team ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: e },
      );
    }
  }

  async findOne(id: number, fields: string[]) {
    if (!id) {
      throw new HttpException(`team cannot be undefined`, HttpStatus.BAD_REQUEST);
    }

    const allowedRelations = [
      'candidates',
      'candidates.candidateProgrammes',
      'candidates.category',
      'candidates.candidateProgrammes.programme',
      'credentials',
      'credentials.categories',
    ];

    // validating fields
    fields = fieldsValidator(fields, allowedRelations);
    // checking if fields contains id
    fields = fieldsIdChecker(fields);

    try {
      const queryBuilder = this.teamRepository
        .createQueryBuilder('team')
        .where('team.id = :id', { id })
        .leftJoinAndSelect('team.candidates', 'candidates')
        .leftJoinAndSelect('candidates.candidateProgrammes', 'candidateProgrammes')
        .leftJoinAndSelect('candidates.category', 'category')
        .leftJoinAndSelect('candidateProgrammes.programme', 'programme')
        .leftJoinAndSelect('team.credentials', 'credentials')
        .leftJoinAndSelect('credentials.categories', 'categories');

      queryBuilder.select(
        fields.map(column => {
          const splitted = column.split('.');

          if (splitted.length > 1) {
            return `${splitted[splitted.length - 2]}.${splitted[splitted.length - 1]}`;
          } else {
            return `team.${column}`;
          }
        }),
      );
      const team = await queryBuilder.getOne();
      return team;
    } catch (e) {
      throw new HttpException(
        'An Error have when finding team ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: e },
      );
    }
  }

 async findOneByName(name: string , fields: string[]) {
    if (!name) {
      throw new HttpException(`team cannot be undefined`, HttpStatus.BAD_REQUEST);
    }
    
    const allowedRelations = [
      'candidates',
      'candidates.candidateProgrammes',
      'candidates.category',
      'candidates.candidateProgrammes.programme',
      'credentials',
      'credentials.categories',
    ];

    // validating fields
    fields = fieldsValidator(fields, allowedRelations);
    // checking if fields contains id
    fields = fieldsIdChecker(fields);

    try {
      const queryBuilder = this.teamRepository
        .createQueryBuilder('team')
        .where('team.name = :name', { name })
        .leftJoinAndSelect('team.candidates', 'candidates')
        .leftJoinAndSelect('candidates.candidateProgrammes', 'candidateProgrammes')
        .leftJoinAndSelect('candidates.category', 'category')
        .leftJoinAndSelect('candidateProgrammes.programme', 'programme')
        .leftJoinAndSelect('team.credentials', 'credentials')
        .leftJoinAndSelect('credentials.categories', 'categories');

      queryBuilder.select(
        fields.map(column => {
          const splitted = column.split('.');

          if (splitted.length > 1) {
            return `${splitted[splitted.length - 2]}.${splitted[splitted.length - 1]}`;
          } else {
            return `team.${column}`;
          }
        }),
      );
      const team = await queryBuilder.getOne();
      return team;
    } catch (e) {
      throw new HttpException(
        'An Error have when finding team ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: e },
      );
    }
  }

  async update(id: number, updateTeamInput: UpdateTeamInput) {
    const team = await this.teamRepository.findOneBy({ id });

    if (!team) {
      throw new HttpException(`cant find team with id ${id}`, HttpStatus.BAD_REQUEST);
    }
    try {
      return this.teamRepository.update(id, updateTeamInput);
    } catch (e) {
      throw new HttpException(
        'An Error have when updating team ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: e },
      );
    }
  }

  async remove(id: number) {
    const team = await this.teamRepository.findOneBy({ id });

    if (!team) {
      throw new HttpException(`cant find team with id ${id}`, HttpStatus.BAD_REQUEST);
    }
    try {
      return this.teamRepository.delete(id);
    } catch (e) {
      throw new HttpException(
        'An Error have when deleting team ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: e },
      );
    }
  }

  async setTeamPoint(
    id: number,
    tPoint: number,
    gPoint: number = 0,
    iPoint: number = 0,
    hPoint: number = 0,
  ) {
    const team: Team = await this.teamRepository.findOneBy({ id });
    if (!team) {
      throw new HttpException(`cant find team with id ${id}`, HttpStatus.BAD_REQUEST);
    }
    const totalPoint = team.totalPoint + tPoint;
    const HousePoint = team.HousePoint + hPoint;
    const GroupPoint = team.GroupPoint + gPoint;
    const IndividualPoint = team.IndividualPoint + iPoint;

    try {
      return this.teamRepository.save({
        ...team,
        totalPoint,
        HousePoint,
        GroupPoint,
        IndividualPoint,
      });
    } catch (e) {
      throw new HttpException(
        'An Error have when inserting total point ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: e },
      );
    }
  }
}
