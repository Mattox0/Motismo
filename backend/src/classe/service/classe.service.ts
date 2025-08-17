import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { Classe } from "@/classe/classe.entity";
import { TranslationService } from "@/translation/translation.service";
import { CreateClasseDto } from "../dto/createClasse.dto";
import { UpdateClasseDto } from "../dto/updateClasse.dto";
import { User } from "@/user/user.entity";
import { Role } from "@/user/role.enum";

@Injectable()
export class ClasseService {
  constructor(
    @InjectRepository(Classe)
    private classesRepository: Repository<Classe>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private translationService: TranslationService,
  ) {}

  async create(classeDto: CreateClasseDto, teacher: User): Promise<Classe> {
    if (teacher.role !== Role.Teacher && teacher.role !== Role.Admin) {
      throw new HttpException(
        await this.translationService.translate("error.ONLY_TEACHERS_CAN_CREATE_CLASSES"),
        HttpStatus.FORBIDDEN,
      );
    }

    const code = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    const classe = this.classesRepository.create({
      ...classeDto,
      code,
      teachers: [teacher],
    });

    return await this.classesRepository.save(classe);
  }

  async findAll(): Promise<Classe[]> {
    return await this.classesRepository.find({
      relations: {
        teachers: true,
        students: true,
      },
    });
  }

  async findOne(id: string): Promise<Classe> {
    const classe = await this.classesRepository.findOne({
      where: { id },
      relations: {
        teachers: true,
        students: true,
      },
    });

    if (!classe) {
      throw new HttpException(await this.translationService.translate("error.CLASSE_NOT_FOUND"), HttpStatus.NOT_FOUND);
    }

    return classe;
  }

  async findByTeacher(teacherId: string): Promise<Classe[]> {
    return await this.classesRepository.find({
      where: {
        teachers: { id: teacherId },
      },
      relations: {
        teachers: true,
        students: true,
      },
    });
  }

  async findByStudent(studentId: string): Promise<Classe[]> {
    return await this.classesRepository.find({
      where: {
        students: { id: studentId },
      },
      relations: {
        teachers: true,
        students: true,
      },
    });
  }

  async update(id: string, updateClasseDto: UpdateClasseDto): Promise<Classe> {
    const classe = await this.findOne(id);

    Object.assign(classe, updateClasseDto);

    return await this.classesRepository.save(classe);
  }

  async remove(id: string): Promise<void> {
    const classe = await this.findOne(id);

    await this.classesRepository.remove(classe);
  }

  async addStudent(classeId: string, studentId: string): Promise<Classe> {
    const classe = await this.findOne(classeId);

    const student = await this.userRepository.findOne({
      where: { id: studentId },
    });

    if (!student) {
      throw new HttpException(await this.translationService.translate("error.USER_NOT_FOUND"), HttpStatus.NOT_FOUND);
    }

    if (student.role !== Role.Student) {
      throw new HttpException(
        await this.translationService.translate("error.ONLY_STUDENTS_CAN_BE_ADDED"),
        HttpStatus.BAD_REQUEST,
      );
    }

    const isAlreadyInClass = classe.students.some((student) => student.id === studentId);

    if (isAlreadyInClass) {
      throw new HttpException(
        await this.translationService.translate("error.STUDENT_ALREADY_IN_CLASSE"),
        HttpStatus.CONFLICT,
      );
    }

    classe.students.push(student);

    return await this.classesRepository.save(classe);
  }

  async removeStudent(classeId: string, studentId: string): Promise<Classe> {
    const classe = await this.findOne(classeId);

    classe.students = classe.students.filter((student) => student.id !== studentId);

    return await this.classesRepository.save(classe);
  }

  async addTeacher(classeId: string, teacherId: string): Promise<Classe> {
    const classe = await this.findOne(classeId);

    const teacher = await this.userRepository.findOne({
      where: { id: teacherId },
    });

    if (!teacher) {
      throw new HttpException(await this.translationService.translate("error.USER_NOT_FOUND"), HttpStatus.NOT_FOUND);
    }

    if (teacher.role !== Role.Teacher && teacher.role !== Role.Admin) {
      throw new HttpException(
        await this.translationService.translate("error.ONLY_TEACHERS_CAN_BE_ADDED"),
        HttpStatus.BAD_REQUEST,
      );
    }

    const isAlreadyInClass = classe.teachers.some((teacher) => teacher.id === teacherId);

    if (isAlreadyInClass) {
      throw new HttpException(
        await this.translationService.translate("error.TEACHER_ALREADY_IN_CLASSE"),
        HttpStatus.CONFLICT,
      );
    }

    classe.teachers.push(teacher);

    return await this.classesRepository.save(classe);
  }

  async removeTeacher(classeId: string, teacherId: string): Promise<Classe> {
    const classe = await this.findOne(classeId);

    classe.teachers = classe.teachers.filter((teacher) => teacher.id !== teacherId);

    return await this.classesRepository.save(classe);
  }
}
