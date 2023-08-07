import { HttpException, HttpStatus, Injectable, UsePipes, ValidationPipe } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryService } from 'src/category/category.service';
import { SectionsService } from 'src/sections/sections.service';
import { TeamsService } from 'src/teams/teams.service';
import { In, Repository } from 'typeorm';
import { CreateCandidateInput } from './dto/create-candidate.input';
import { UpdateCandidateInput } from './dto/update-candidate.input';
import { Candidate } from './entities/candidate.entity';
import { Gender } from './entities/candidate.entity';
import { Category } from 'src/category/entities/category.entity';
import { Credential } from 'src/credentials/entities/credential.entity';
import { CandidateProgrammeService } from 'src/candidate-programme/candidate-programme.service';
import { Team } from 'src/teams/entities/team.entity';
import { CreateInput } from './dto/create-input.dto';
import { CredentialsService } from 'src/credentials/credentials.service';
import { fieldsIdChecker, fieldsValidator } from 'src/utill/util';
import { createReadStream } from 'fs';
import { join } from 'path';
import { Readable } from 'stream';
import { driveConfig } from '../utill/googleApi.auth';
// import { drive } from 'src/utils/googleApi.auth';

@Injectable()
export class CandidatesService {
  constructor(
    @InjectRepository(Candidate) private candidateRepository: Repository<Candidate>,
    private teamService: TeamsService,
    private categoryService: CategoryService,
    private sectionService: SectionsService,
    private candidateProgrammeService: CandidateProgrammeService,
    private credentialService: CredentialsService,
  ) {}

  //  To create many candidates at a time , Normally using on Excel file upload

  async createMany(createCandidateInputArray: CreateInput, user: Credential) {
    // the final data variable
    var FinalData: Candidate[] = [];
    var allData: {
      adno: number;
      category: Category;
      chestNO: number;
      class: number;
      dob: string;
      name: string;
      gender: Gender;
      team: Team;
    }[] = [];

    // Iterate the values and taking all the individuals

    for (let index = 0; index < createCandidateInputArray.inputs.length; index++) {
      const createCandidateInput = createCandidateInputArray.inputs[index];

      //  checking is category exist

      const category_id = await this.categoryService.findOneByName(createCandidateInput.category);

      if (!category_id) {
        throw new HttpException(
          `Cant find a category named ${createCandidateInput.category}  ,ie: check on Category of ${createCandidateInput.name}`,
          HttpStatus.BAD_REQUEST,
        );
      }

      // authenticating the user have permission to create the candidates

      this.credentialService.checkPermissionOnCategories(user, category_id.name);

      //  checking is team exist

      const team_id = await this.teamService.findOneByName(createCandidateInput.team, ['id']);

      if (!team_id) {
        throw new HttpException(
          `Cant find a team named ${createCandidateInput.team} ,ie: check on Team of ${createCandidateInput.name}`,
          HttpStatus.BAD_REQUEST,
        );
      }

      // checking is chessNo already exist
      const candidate = await this.candidateRepository.findOne({
        where: {
          chestNO: createCandidateInput.chestNO,
        },
      });

      if (candidate) {
        throw new HttpException(
          `Candidate with chess no ${createCandidateInput.chestNO} already exists ,ie: check on chessNo of ${createCandidateInput.name}`,
          HttpStatus.BAD_REQUEST,
        );
      }

      // checking is chestNo already exist in the array

      const chestNoExists = allData.some(data => data.chestNO === createCandidateInput.chestNO);

      if (chestNoExists) {
        throw new HttpException(
          `Multiple candidates have same chest no ${createCandidateInput.chestNO} ,ie: check on chestNo of ${createCandidateInput.name}`,
          HttpStatus.BAD_REQUEST,
        );
      }

      allData.push({
        adno: createCandidateInput.adno,
        category: category_id,
        chestNO: createCandidateInput.chestNO,
        class: createCandidateInput.class,
        dob: createCandidateInput.dob,
        name: createCandidateInput.name,
        gender: createCandidateInput.gender,
        team: team_id,
      });
    }

    // looping the values

    try {
      // checking all candidates are checked

      if (allData.length !== createCandidateInputArray.inputs.length) {
        throw new HttpException(
          `Some candidates are not eligible to create ,ie: check on candidates`,
          HttpStatus.BAD_REQUEST,
        );
      }

      for (let index = 0; index < allData.length; index++) {
        const data = allData[index];

        // creating a instance of Candidate
        const input = new Candidate();

        // updating Value to candidate
        input.adno = data.adno;
        input.category = data.category;
        input.chestNO = data.chestNO;
        input.class = data.class;
        input.dob = data.dob;
        input.gender = data.gender;
        input.name = data.name;
        input.team = data.team;

        let saveData = await this.candidateRepository.save(input);

        FinalData.push(saveData);
      }

      return FinalData;
    } catch (e) {
      throw new HttpException(
        'An Error have when inserting data , please check the all required fields are filled ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: e },
      );
    }
  }

  // create a single candidate
  async create(createCandidateInput: CreateCandidateInput, user: Credential): Promise<Candidate> {
    //  checking is category exist

    const category_id = await this.categoryService.findOneByName(createCandidateInput.category);

    if (!category_id) {
      throw new HttpException(
        `Cant find a category named ${createCandidateInput.category}  ,ie: check on Category of ${createCandidateInput.name}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // authenticating the user have permission to update the category

    this.credentialService.checkPermissionOnCategories(user, category_id.name);

    //  checking is team exist

    const team_id = await this.teamService.findOneByName(createCandidateInput.team, ['id']);

    if (!team_id) {
      throw new HttpException(
        `Cant find a team named ${createCandidateInput.team} ,ie: check on Team of ${createCandidateInput.name}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // checking is chessNo already exist
    const candidate = await this.candidateRepository.findOne({
      where: {
        chestNO: createCandidateInput.chestNO,
      },
    });

    if (candidate) {
      throw new HttpException(
        `Candidate with chess no ${createCandidateInput.chestNO} already exists ,ie: check on chessNo of ${createCandidateInput.name}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      // creating a instance of Candidate
      const input = new Candidate();

      // updating Value to candidate
      input.adno = createCandidateInput.adno;
      input.category = category_id;
      input.chestNO = createCandidateInput.chestNO;
      input.class = createCandidateInput.class;
      input.dob = createCandidateInput.dob;
      input.gender = createCandidateInput.gender;
      input.name = createCandidateInput.name;
      input.team = team_id;

      return this.candidateRepository.save(input);
    } catch (e) {
      throw new HttpException(
        'An Error have when inserting data , please check the all required fields are filled ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: e },
      );
    }
  }

  async findAll(fields: string[]) {
    const allowedRelations = [
      'category',
      'team',
      'candidateProgrammes',
      'candidateProgrammes.programme',
    ];

    // validating fields
    fields = fieldsValidator(fields, allowedRelations);
    // checking if fields contains id
    fields = fieldsIdChecker(fields);

    try {
      const queryBuilder = this.candidateRepository
        .createQueryBuilder('candidate')
        .leftJoinAndSelect('candidate.category', 'category')
        .leftJoinAndSelect('candidate.team', 'team')
        .leftJoinAndSelect('candidate.candidateProgrammes', 'candidateProgrammes')
        .leftJoinAndSelect('candidateProgrammes.programme', 'programme');

      queryBuilder.select(
        fields.map(column => {
          const splitted = column.split('.');

          if (splitted.length > 1) {
            return `${splitted[splitted.length - 2]}.${splitted[splitted.length - 1]}`;
          } else {
            return `candidate.${column}`;
          }
        }),
      );
      const candidate = await queryBuilder.getMany();
      return candidate;
    } catch (e) {
      throw new HttpException(
        'An Error have when finding candidate ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: e },
      );
    }
  }

  findByCategories(categories: string[]) {
    try {
      const candidates = this.candidateRepository.find({
        where: {
          category: In(categories),
        },
        relations: ['category', 'team', 'candidateProgrammes'],
      });

      if (!candidates) {
        throw new HttpException(
          `Cant find candidates with categories ${categories} `,
          HttpStatus.BAD_REQUEST,
        );
      }

      return candidates;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR, { cause: e });
    }
  }

  async findOne(id: number, fields: string[]) {
    const allowedRelations = [
      'category',
      'team',
      'candidateProgrammes',
      'candidateProgrammes.programme',
    ];

    // validating fields
    fields = fieldsValidator(fields, allowedRelations);
    // checking if fields contains id
    fields = fieldsIdChecker(fields);
    try {
      const queryBuilder = this.candidateRepository
        .createQueryBuilder('candidate')
        .where('candidate.id = :id', { id })
        .leftJoinAndSelect('candidate.category', 'category')
        .leftJoinAndSelect('candidate.team', 'team')
        .leftJoinAndSelect('candidate.candidateProgrammes', 'candidateProgrammes')
        .leftJoinAndSelect('candidateProgrammes.programme', 'programme');

      queryBuilder.select(
        fields.map(column => {
          const splitted = column.split('.');

          if (splitted.length > 1) {
            return `${splitted[splitted.length - 2]}.${splitted[splitted.length - 1]}`;
          } else {
            return `candidate.${column}`;
          }
        }),
      );
      const candidate = await queryBuilder.getOne();
      return candidate;
    } catch (e) {
      throw new HttpException(
        'An Error have when finding candidate ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: e },
      );
    }
  }

  async findOneByChestNo(chestNO: number) {
    try {
      const candidate = await this.candidateRepository.findOne({
        where: {
          chestNO,
        },
        relations: ['category', 'team', 'candidateProgrammes'],
      });

      if (!candidate) {
        throw new HttpException(
          `Cant find candidate with chest no ${chestNO} `,
          HttpStatus.BAD_REQUEST,
        );
      }

      return candidate;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR, { cause: e });
    }
  }

  async findOneByChesNoByFields(chestNO: number, fields: string[]) {
    const allowedRelations = ['category', 'team', 'candidateProgrammes'];

    // validating fields
    fields = fieldsValidator(fields, allowedRelations);
    // checking if fields contains id
    fields = fieldsIdChecker(fields);
    try {
      const queryBuilder = this.candidateRepository
        .createQueryBuilder('candidate')
        .where('candidate.chestNO = :chestNO', { chestNO })
        .leftJoinAndSelect('candidate.category', 'category')
        .leftJoinAndSelect('candidate.team', 'team')
        .leftJoinAndSelect('candidate.candidateProgrammes', 'candidateProgrammes')
        .leftJoinAndSelect('candidateProgrammes.programme', 'programme');

      queryBuilder.select(
        fields.map(column => {
          const splitted = column.split('.');

          if (splitted.length > 1) {
            return `${splitted[splitted.length - 2]}.${splitted[splitted.length - 1]}`;
          } else {
            return `candidate.${column}`;
          }
        }),
      );
      const candidate = await queryBuilder.getOne();
      return candidate;
    } catch (e) {
      throw new HttpException(
        'An Error have when finding candidate ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: e },
      );
    }
  }

  // check is candidate in a programme

  async findOneByChestNoAndProgrammeId(chestNO: number, programmeCode: string) {
    // checking is candidate exist

    const candidate = await this.candidateRepository.findOne({
      where: {
        chestNO,
      },
      relations: ['candidateProgrammes'],
    });

    if (!candidate) {
      throw new HttpException(`Cant find candidate with name ${chestNO} `, HttpStatus.BAD_REQUEST);
    }

    // checking is candidate in programme

    const candidateProgramme = candidate.candidateProgrammes?.find(
      candidateProgramme => candidateProgramme.programme?.programCode === programmeCode,
    );

    return candidateProgramme;
  }

  // Update data

  async update(id: number, updateCandidateInput: UpdateCandidateInput, user: Credential) {
    // --------------------
    // checking .........
    // --------------------
    //  checking is category exist

    const category_id = await this.categoryService.findOneByName(updateCandidateInput.category);

    if (!category_id) {
      throw new HttpException(
        `Cant find a category named ${updateCandidateInput.category}  ,ie: check on Category of ${updateCandidateInput.name}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // authenticating the user have permission to update the category

    this.credentialService.checkPermissionOnCategories(user, category_id.name);

    // checking is candidate exist

    const candidate = await this.candidateRepository.findOneBy({ id });

    if (!candidate) {
      throw new HttpException(
        `Cant find a candidate named ${updateCandidateInput.name}}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    //  checking is team exist

    const team_id = await this.teamService.findOneByName(updateCandidateInput.team, ['id']);

    if (!team_id) {
      throw new HttpException(
        `Cant find a team named ${updateCandidateInput.team} ,ie: check on Team of ${updateCandidateInput.name}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      // creating a instance of Candidate
      const input = new Candidate();

      // updating Value to candidate
      input.adno = updateCandidateInput.adno;
      input.category = category_id;
      input.chestNO = updateCandidateInput.chestNO;
      input.class = updateCandidateInput.class;
      input.dob = updateCandidateInput.dob;
      input.gender = updateCandidateInput.gender;
      input.name = updateCandidateInput.name;
      input.team = team_id;

      return this.candidateRepository.update(id, input);
      // return this.candidateRepository.save(input)
    } catch (e) {
      throw new HttpException(
        'An Error have when updating data , please check the all required fields are filled ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: e },
      );
    }
  }

  async remove(id: number, user: Credential) {
    // --------------------
    // checking .........
    // --------------------

    // checking is candidate exist

    const candidate = await this.findOne(id, ['category.name']);

    const category_id = await this.categoryService.findOneByName(candidate?.category?.name);

    if (!category_id) {
      throw new HttpException(
        `Cant find a category named ${candidate?.category?.name}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // authenticating the user have permission to update the category

    this.credentialService.checkPermissionOnCategories(user, category_id.name);

    if (!candidate) {
      throw new HttpException(`Cant find a candidate to delete`, HttpStatus.BAD_REQUEST);
    }

    try {
      return this.candidateRepository.delete(id);
    } catch (e) {
      throw new HttpException(
        'An Error have when deleting data ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: e },
      );
    }
  }

  // add individual or group point to candidate

  async addPoint(id: number, indPoint: number = 0, groupPoint: number = 0) {
    const candidate = await this.candidateRepository.findOneBy({ id });

    if (!candidate) {
      throw new HttpException(`Cant find a candidate to add point`, HttpStatus.BAD_REQUEST);
    }

    const individualPoint = candidate.individualPoint + indPoint;
    const groupPointTotal = candidate.groupPoint + groupPoint;

    try {
      return this.candidateRepository.save({
        ...candidate,
        individualPoint,
        groupPoint: groupPointTotal,
      });
    } catch (err) {
      throw new HttpException(
        'An Error have when updating candidate point ',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: err },
      );
    }
  }

  // image upload to google drive and save id to candidate

async uploadFiles(files: Express.Multer.File[]) {
    
  for (let index = 0; index < files.length; index++) {
    const file = files[index];

    const chestNo = parseInt(file.originalname.split('.')[0]);

    

    await this.uploadFile(chestNo, file.buffer, file.originalname, file.mimetype);

  }

    return 'done';
  }

  async uploadFile(  chestNo: number , filePath: Buffer, fileName: string, mimeType: string) {


    const candidate = await this.candidateChecker(chestNo,mimeType)

   
    // check the file is image
    const buffer = Buffer.from(filePath);

    // change the buffer to readable stream
    const readableStream = new Readable({
      read() {
        this.push(buffer);
        this.push(null);
      },
    });

    // Get the file extension.
  const fileExtension = fileName.split('.')[1];


    // get the folder id
    const folderId = process.env.DRIVE_CANDIDATES_FOLDER_ID;

    try {
      // driveConfig
      const drive = driveConfig();

      const response = await drive.files.create({
        requestBody: {
          name: `${chestNo}.${fileExtension}`, //file name
          mimeType,
          parents: folderId ? [folderId] : [],
        },
        media: {
          mimeType,
          body: readableStream,
        },
      });
      // report the response from the request

      // save image id to candidate

      candidate.imageId = response.data.id;

      return this.candidateRepository.save(candidate);
      
    } catch (error) {
      //report the error message
      throw new HttpException(
        `Error on google drive upload , check the image of ${chestNo}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

 async candidateChecker(chestNo , mimeType ){
    const candidate =await this.findOneByChesNoByFields(chestNo,['id'])

    if (!candidate) {
      throw new HttpException(
        `can't find candidate with chest no ${chestNo}`,
        HttpStatus.BAD_REQUEST,
      );
    }

     // check the file is image
     if (!mimeType.includes('image')) {
      throw new HttpException(`File is not an image`, HttpStatus.BAD_REQUEST);
    }

    return candidate

  }
}
