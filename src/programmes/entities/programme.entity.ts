import { ObjectType, Field, Int, registerEnumType } from '@nestjs/graphql';
import { Expose } from 'class-transformer';
import { CandidateProgramme } from 'src/candidate-programme/entities/candidate-programme.entity';
import { Category } from 'src/category/entities/category.entity';
import { Section } from 'src/sections/entities/section.entity';
import { Skill } from 'src/skill/entities/skill.entity';
import { Column, CreateDateColumn, Entity, JoinTable, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';


export enum Mode {
  STAGE = 'STAGE',
  NON_STAGE = 'NON_STAGE',
  OUTDOOR_STAGE = 'OUTDOOR_STAGE'
}

export enum Type {
  SINGLE = 'SINGLE',
  GROUP = 'GROUP',
  HOUSE = 'HOUSE'
}

registerEnumType(Mode, {
  name: 'Models',
});

registerEnumType(Type, {
  name: 'Types',
});

@ObjectType()
@Entity()
export class Programme {

  // Primary generated ID
  
  @Field(() => Int, { description: 'Example field (placeholder)' })
  @PrimaryGeneratedColumn()
  id: number;

  // Normal columns

  @Column({unique:true})
  @Field()
  programCode: string;

  @Column()
  @Field()
  name: string;

  @Column()
  @Field(()=> Mode)
  mode: Mode;

  @Column()
  @Field(()=> Type)
  type: Type;

  @Column({nullable:true})
  @Field(()=> Int)
  groupCount: number;

  @Column()
  @Field(()=> Int )
  candidateCount: number;

  @Column({nullable:true})
  @Field(()=> Date )
  date: Date;

  @Column({nullable:true})
  @Field(()=> Int )
  venue: number;

  @Column()
  @Field(()=> Int)
  duration: number;

  @Column()
  @Field()
  conceptNote: string;

  @Column({default: false})
  @Field(()=> Boolean)
  resultEntered: Boolean;

  @Column({default: false})
  @Field(()=> Boolean)
  resultPublished: Boolean;

  // OneToMany relations

  @OneToMany(() => CandidateProgramme, (CandidateProgramme) => CandidateProgramme.programme)
  @JoinTable()
  @Field(()=> [CandidateProgramme])
  candidateProgramme: CandidateProgramme[];

  // ManyTOOne relations

  @ManyToOne(()=> Skill, (skill) => skill.programmes , { eager: true , onDelete : 'SET NULL'} )
  @Field(()=> Skill , { nullable: true })
  skill: Skill;

  @ManyToOne(()=> Category, (category) => category.programmes , { eager: true , onDelete : 'SET NULL'})
  @Field(()=> Category , { nullable: true })
  category : Category;

  @ManyToOne(()=> Section, (section) => section.programmes , { eager: true , onDelete : 'SET NULL'})
  @Field(()=> Section , { nullable: true })
  section: Section;

  // Dates

  @Expose()
  @Field(()=> Date)
  @CreateDateColumn()
  createdAt: Date;

  @Expose()
  @Field(()=> Date)
  @UpdateDateColumn()
  updatedAt: Date;

  
}
