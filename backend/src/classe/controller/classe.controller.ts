import { Body, Controller, Delete, Get, Post, Put, UseGuards } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";

import { UserAuthGuard } from "@/auth/guards/user-auth.guard";
import { TranslationService } from "@/translation/translation.service";
import { CurrentUser } from "@/user/decorators/currentUser.decorator";
import { TeacherRequest, StudentRequest } from "@/user/decorators/user.decorator";
import { TeacherGuard } from "@/user/guards/teacher.guard";
import { StudentGuard } from "@/user/guards/student.guard";
import { User } from "@/user/user.entity";
import { Role } from "@/user/role.enum";
import { Classe } from "@/classe/classe.entity";
import { ClasseService } from "@/classe/service/classe.service";
import { CreateClasseDto } from "@/classe/dto/createClasse.dto";
import { UpdateClasseDto } from "@/classe/dto/updateClasse.dto";
import { AddStudentDto } from "@/classe/dto/addStudent.dto";
import { ClasseGuard } from "@/classe/guards/classe.guard";
import { TeacherClasseGuard } from "@/classe/guards/teacher-classe.guard";
import { ClasseRequest } from "@/classe/decorators/classe.decorator";

@UseGuards(UserAuthGuard)
@ApiTags("classes")
@ApiUnauthorizedResponse({ description: "User not connected" })
@Controller("classes")
export class ClasseController {
  constructor(
    private readonly classeService: ClasseService,
    private readonly translationService: TranslationService,
  ) {}

  @Post()
  @ApiOperation({ summary: "Create a new class" })
  @ApiCreatedResponse({ description: "Class created successfully", type: Classe })
  @ApiForbiddenResponse({ description: "Only teachers can create classes" })
  @ApiBadRequestResponse({ description: "Invalid request body" })
  async create(@Body() createClasseDto: CreateClasseDto, @CurrentUser() teacher: User): Promise<Classe> {
    return await this.classeService.create(createClasseDto, teacher);
  }

  @Get()
  @ApiOperation({ summary: "Get all classes" })
  @ApiOkResponse({ description: "Classes found successfully", type: Classe, isArray: true })
  async findAll(): Promise<Classe[]> {
    return await this.classeService.findAll();
  }

  @Get("my-classes")
  @ApiOperation({ summary: "Get classes of current user" })
  @ApiOkResponse({ description: "Classes found successfully", type: Classe, isArray: true })
  async findMyClasses(@CurrentUser() user: User): Promise<Classe[]> {
    if (user.role === Role.Teacher || user.role === Role.Admin) {
      return await this.classeService.findByTeacher(user.id);
    }

    return await this.classeService.findByStudent(user.id);
  }

  @Get(":classeId")
  @UseGuards(ClasseGuard)
  @ApiOperation({ summary: "Get a class by id" })
  @ApiParam({ name: "classeId", description: "ID of class", required: true })
  @ApiOkResponse({ description: "Class found successfully", type: Classe })
  @ApiNotFoundResponse({ description: "Class not found" })
  findOne(@ClasseRequest() classe: Classe): Classe {
    return classe;
  }

  @Put(":classeId")
  @UseGuards(ClasseGuard, TeacherClasseGuard)
  @ApiOperation({ summary: "Update a class" })
  @ApiParam({ name: "classeId", description: "ID of class", required: true })
  @ApiOkResponse({ description: "Class updated successfully", type: Classe })
  @ApiNotFoundResponse({ description: "Class not found" })
  @ApiForbiddenResponse({ description: "Not authorized to update this class" })
  @ApiBadRequestResponse({ description: "Invalid request body" })
  async update(@ClasseRequest() classe: Classe, @Body() updateClasseDto: UpdateClasseDto): Promise<Classe> {
    return await this.classeService.update(classe.id, updateClasseDto);
  }

  @Delete(":classeId")
  @UseGuards(ClasseGuard, TeacherClasseGuard)
  @ApiOperation({ summary: "Delete a class" })
  @ApiParam({ name: "classeId", description: "ID of class", required: true })
  @ApiOkResponse({ description: "Class deleted successfully" })
  @ApiNotFoundResponse({ description: "Class not found" })
  @ApiForbiddenResponse({ description: "Not authorized to delete this class" })
  async remove(@ClasseRequest() classe: Classe): Promise<void> {
    await this.classeService.remove(classe.id);
  }

  @Post(":classeId/students")
  @UseGuards(ClasseGuard, TeacherClasseGuard)
  @ApiOperation({ summary: "Add a student to a class" })
  @ApiParam({ name: "classeId", description: "ID of class", required: true })
  @ApiCreatedResponse({ description: "Student added successfully", type: Classe })
  @ApiNotFoundResponse({ description: "Class or student not found" })
  @ApiForbiddenResponse({ description: "Not authorized to modify this class" })
  @ApiConflictResponse({ description: "Student already in class" })
  @ApiBadRequestResponse({ description: "Invalid student or student is not a student" })
  async addStudent(@ClasseRequest() classe: Classe, @Body() addStudentDto: AddStudentDto): Promise<Classe> {
    return await this.classeService.addStudent(classe.id, addStudentDto.studentId);
  }

  @Delete(":classeId/students/:studentId")
  @UseGuards(ClasseGuard, TeacherClasseGuard, StudentGuard)
  @ApiOperation({ summary: "Remove a student from a class" })
  @ApiParam({ name: "classeId", description: "ID of class", required: true })
  @ApiParam({ name: "studentId", description: "ID of student", required: true })
  @ApiOkResponse({ description: "Student removed successfully", type: Classe })
  @ApiNotFoundResponse({ description: "Class not found" })
  @ApiForbiddenResponse({ description: "Not authorized to modify this class" })
  async removeStudent(@ClasseRequest() classe: Classe, @StudentRequest() student: User): Promise<Classe> {
    return await this.classeService.removeStudent(classe.id, student.id);
  }

  @Post(":classeId/teachers/:teacherId")
  @UseGuards(ClasseGuard, TeacherClasseGuard, TeacherGuard)
  @ApiOperation({ summary: "Add a teacher to a class (Admin only)" })
  @ApiParam({ name: "classeId", description: "ID of class", required: true })
  @ApiParam({ name: "teacherId", description: "ID of teacher", required: true })
  @ApiCreatedResponse({ description: "Teacher added successfully", type: Classe })
  @ApiNotFoundResponse({ description: "Class or teacher not found" })
  @ApiUnauthorizedResponse({ description: "User not admin" })
  @ApiConflictResponse({ description: "Teacher already in class" })
  @ApiBadRequestResponse({ description: "Invalid teacher or teacher is not a teacher" })
  async addTeacher(@ClasseRequest() classe: Classe, @TeacherRequest() teacher: User): Promise<Classe> {
    return await this.classeService.addTeacher(classe.id, teacher.id);
  }

  @Delete(":classeId/teachers/:teacherId")
  @UseGuards(ClasseGuard, TeacherClasseGuard, TeacherGuard)
  @ApiOperation({ summary: "Remove a teacher from a class (Admin only)" })
  @ApiParam({ name: "classeId", description: "ID of class", required: true })
  @ApiParam({ name: "teacherId", description: "ID of teacher", required: true })
  @ApiOkResponse({ description: "Teacher removed successfully", type: Classe })
  @ApiNotFoundResponse({ description: "Class not found" })
  @ApiUnauthorizedResponse({ description: "User not admin" })
  async removeTeacher(@ClasseRequest() classe: Classe, @TeacherRequest() teacher: User): Promise<Classe> {
    return await this.classeService.removeTeacher(classe.id, teacher.id);
  }
}
