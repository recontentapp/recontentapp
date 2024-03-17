import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import { Components, Paths } from 'src/generated/typeDefinitions'
import { AuthService } from 'src/modules/auth/auth.service'
import { JwtAuthGuard } from 'src/modules/auth/jwt-auth.guard'
import { Public } from 'src/utils/is-public.decorator'
import { Throttle } from '@nestjs/throttler'
import { PrismaService } from 'src/utils/prisma.service'
import { AuthenticatedRequester, Requester } from 'src/utils/requester'
import {
  ConfirmSignUpDto,
  LoginDto,
  SignUpDto,
  UpdateCurrentUserDto,
} from './dto/authentication.dto'
import {
  AddLanguagesToWorkspaceDto,
  CreateWorkspaceDto,
  CreateWorkspaceServiceAccountDto,
  InviteToWorkspaceDto,
  JoinWorkspaceDto,
} from './dto/workspace.dto'
import { WorkspaceService } from 'src/modules/workspace/workspace.service'
import {
  Language,
  Project,
  ProjectRevision,
  User,
  Workspace,
  WorkspaceAccount,
} from '@prisma/client'
import { Pagination, PaginationParams } from 'src/utils/pagination'
import {
  AddLanguagesToProjectDto,
  CreateProjectDto,
  DeleteProjectDto,
  UpdateProjectDto,
} from './dto/project.dto'
import { ProjectService } from 'src/modules/project/project.service'

@Controller('private-api')
@UseGuards(JwtAuthGuard)
export class ApiController {
  constructor(
    private readonly authService: AuthService,
    private readonly workspaceService: WorkspaceService,
    private readonly projectService: ProjectService,
    private readonly prismaService: PrismaService,
  ) {}

  private static formatWorkspace(
    workspace: Workspace,
  ): Components.Schemas.Workspace {
    return {
      id: workspace.id,
      name: workspace.name,
      key: workspace.key,
      createdAt: workspace.createdAt.toISOString(),
      updatedAt: workspace.updatedAt.toISOString(),
      createdBy: workspace.createdBy,
      updatedBy: workspace.updatedBy,
    }
  }

  private static formatCurrentUser(
    user: User & {
      accounts: Array<WorkspaceAccount & { workspace: Workspace }>
    },
  ): Components.Schemas.CurrentUser {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      accounts: user.accounts.map(account => ({
        id: account.id,
        role: account.role,
        workspace: ApiController.formatWorkspace(account.workspace),
      })),
    }
  }

  private static formatLanguage(
    language: Language,
  ): Components.Schemas.Language {
    return {
      id: language.id,
      workspaceId: language.workspaceId,
      locale: language.locale,
      name: language.name,
      createdAt: language.createdAt.toISOString(),
      updatedAt: language.updatedAt.toISOString(),
      createdBy: language.createdBy,
      updatedBy: language.updatedBy,
    }
  }

  private static formatProject(
    project: Project & { languages: Language[] },
  ): Components.Schemas.Project {
    return {
      id: project.id,
      workspaceId: project.workspaceId,
      name: project.name,
      description: project.description,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
      createdBy: project.createdBy,
      updatedBy: project.updatedBy,
      languages: project.languages.map(ApiController.formatLanguage),
    }
  }

  private static formatProjectRevision(
    revision: ProjectRevision,
  ): Components.Schemas.ProjectRevision {
    return {
      id: revision.id,
      projectId: revision.projectId,
      workspaceId: revision.workspaceId,
      isMaster: revision.isMaster,
      name: revision.name,
      state: revision.state,
      createdAt: revision.createdAt.toISOString(),
      updatedAt: revision.updatedAt.toISOString(),
      createdBy: revision.createdBy,
      updatedBy: revision.updatedBy,
    }
  }

  @Throttle({ default: { limit: 1, ttl: 1000 } })
  @Post('/LogIn')
  @Public()
  async login(
    @Body() { email, password }: LoginDto,
  ): Promise<Paths.LogIn.Responses.$200> {
    const { accessToken } = await this.authService.login({ email, password })
    return { accessToken }
  }

  @Throttle({ default: { limit: 1, ttl: 5000 } })
  @Post('/SignUp')
  @Public()
  async signUp(
    @Body() { email, password }: SignUpDto,
  ): Promise<Paths.SignUp.Responses.$201> {
    await this.authService.createUser({
      email,
      password,
      firstName: '',
      lastName: '',
    })
    return {}
  }

  @Post('/ConfirmSignUp')
  @Public()
  async confirmUser(
    @Body() { email, password, confirmationCode }: ConfirmSignUpDto,
  ): Promise<Paths.ConfirmSignUp.Responses.$201> {
    await this.authService.confirmUser({
      email,
      password,
      confirmationCode,
    })
    return {}
  }

  @Get('/GetCurrentUser')
  async getCurrentUser(
    @AuthenticatedRequester() requester: Requester,
  ): Promise<Paths.GetCurrentUser.Responses.$200> {
    if (requester.type !== 'human') {
      throw new BadRequestException('Invalid requester')
    }

    const user = await this.prismaService.user.findUniqueOrThrow({
      where: { id: requester.userId },
      include: {
        accounts: {
          include: {
            workspace: true,
          },
        },
      },
    })

    return ApiController.formatCurrentUser(user)
  }

  @Post('/UpdateCurrentUser')
  async updateCurrentUser(
    @Body() { firstName, lastName }: UpdateCurrentUserDto,
    @AuthenticatedRequester() requester: Requester,
  ): Promise<Paths.UpdateCurrentUser.Responses.$200> {
    if (requester.type !== 'human') {
      throw new BadRequestException('Invalid requester')
    }

    await this.authService.updateUser({
      id: requester.userId,
      firstName,
      lastName,
    })

    const user = await this.prismaService.user.findUniqueOrThrow({
      where: { id: requester.userId },
      include: {
        accounts: {
          include: {
            workspace: true,
          },
        },
      },
    })

    return ApiController.formatCurrentUser(user)
  }

  @Get('/GetWorkspaceAvailability')
  async getWorkspaceAvailability(
    @Query('key') key: string,
  ): Promise<Paths.GetWorkspaceAvailability.Responses.$200> {
    const isAvailable = await this.workspaceService.isWorkspaceKeyAvailable(key)
    return {
      isAvailable,
    }
  }

  @Throttle({ default: { limit: 1, ttl: 5000 } })
  @Post('/CreateWorkspace')
  async createWorkspace(
    @Body() { key, name }: CreateWorkspaceDto,
    @AuthenticatedRequester() requester: Requester,
  ): Promise<Paths.CreateWorkspace.Responses.$201> {
    if (requester.type !== 'human') {
      throw new BadRequestException('Invalid requester')
    }

    const workspace = await this.workspaceService.createWorkspace({
      key,
      name,
      requester,
    })

    return ApiController.formatWorkspace(workspace)
  }

  @Get('/GetWorkspace')
  async getWorkspace(
    @Query('id') id: string,
    @AuthenticatedRequester() requester: Requester,
  ): Promise<Paths.GetWorkspace.Responses.$200> {
    const workspace = await this.workspaceService.getWorkspace({
      workspaceId: id,
      requester,
    })

    return ApiController.formatWorkspace(workspace)
  }

  @Post('/InviteToWorkspace')
  async inviteToWorkspace(
    @Body() { email, role, workspaceId }: InviteToWorkspaceDto,
    @AuthenticatedRequester() requester: Requester,
  ): Promise<Paths.InviteToWorkspace.Responses.$201> {
    if (requester.type !== 'human') {
      throw new BadRequestException('Invalid requester')
    }

    await this.workspaceService.inviteToWorkspace({
      email,
      role,
      workspaceId,
      requester,
    })

    return {}
  }

  @Post('/JoinWorkspace')
  async joinWorkspace(
    @Body() { invitationCode }: JoinWorkspaceDto,
    @AuthenticatedRequester() requester: Requester,
  ): Promise<Paths.JoinWorkspace.Responses.$201> {
    if (requester.type !== 'human') {
      throw new BadRequestException('Invalid requester')
    }

    await this.workspaceService.joinWorkspace({ invitationCode, requester })
    return {}
  }

  @Get('/ListWorkspaceAccounts')
  async listWorkspaceAccounts(
    @Query('workspaceId') workspaceId: string,
    @Query('type') type: string,
    @Pagination() pagination: PaginationParams,
    @AuthenticatedRequester() requester: Requester,
  ): Promise<Paths.ListWorkspaceAccounts.Responses.$200> {
    if (type !== 'human' && type !== 'service' && type !== 'all') {
      throw new BadRequestException('Invalid type')
    }

    const result = await this.workspaceService.listWorkspaceAccounts({
      workspaceId,
      requester,
      pagination,
      type,
    })

    return result
  }

  @Post('/CreateWorkspaceServiceAccount')
  async createWorkspaceServiceAccount(
    @Body() { workspaceId, name, role }: CreateWorkspaceServiceAccountDto,
    @AuthenticatedRequester() requester: Requester,
  ): Promise<Paths.CreateWorkspaceServiceAccount.Responses.$201> {
    if (requester.type !== 'human') {
      throw new BadRequestException('Invalid requester')
    }

    await this.workspaceService.createWorkspaceServiceAccount({
      workspaceId,
      requester,
      name,
      role,
    })

    return {}
  }

  @Get('/ListWorkspaceLanguages')
  async listWorkspaceLanguages(
    @Query('workspaceId') workspaceId: string,
    @AuthenticatedRequester() requester: Requester,
  ): Promise<Paths.ListWorkspaceLanguages.Responses.$200> {
    const languages = await this.workspaceService.listWorkspaceLanguages({
      workspaceId,
      requester,
    })

    return languages.map(ApiController.formatLanguage)
  }

  @Post('/AddLanguagesToWorkspace')
  async addLanguagesToWorkspace(
    @Body() { workspaceId, languages }: AddLanguagesToWorkspaceDto,
    @AuthenticatedRequester() requester: Requester,
  ): Promise<Paths.AddLanguagesToWorkspace.Responses.$201> {
    if (requester.type !== 'human') {
      throw new BadRequestException('Invalid requester')
    }

    await this.workspaceService.addLanguagesToWorkspace({
      workspaceId,
      requester,
      languages,
    })

    return {}
  }

  @Post('/CreateProject')
  async createProject(
    @Body() { name, workspaceId, languageIds, description }: CreateProjectDto,
    @AuthenticatedRequester() requester: Requester,
  ): Promise<Paths.CreateProject.Responses.$201> {
    if (requester.type !== 'human') {
      throw new BadRequestException('Invalid requester')
    }

    const project = await this.projectService.createProject({
      name,
      workspaceId,
      languageIds,
      description: description ?? undefined,
      requester,
    })

    return ApiController.formatProject(project)
  }

  @Post('/UpdateProject')
  async updateProject(
    @Body() { id, name, description }: UpdateProjectDto,
    @AuthenticatedRequester() requester: Requester,
  ): Promise<Paths.UpdateProject.Responses.$200> {
    if (requester.type !== 'human') {
      throw new BadRequestException('Invalid requester')
    }

    const project = await this.projectService.updateProject({
      id,
      name,
      description: description ?? undefined,
      requester,
    })

    return ApiController.formatProject(project)
  }

  @Get('/GetProject')
  async getProject(
    @Query('id') id: string,
    @AuthenticatedRequester() requester: Requester,
  ): Promise<Paths.GetProject.Responses.$200> {
    if (requester.type !== 'human') {
      throw new BadRequestException('Invalid requester')
    }

    const project = await this.projectService.getProject({
      projectId: id,
      requester,
    })

    return ApiController.formatProject(project)
  }

  @Post('/AddLanguagesToProject')
  async addLanguagesToProject(
    @Body() { projectId, languageIds }: AddLanguagesToProjectDto,
    @AuthenticatedRequester() requester: Requester,
  ): Promise<Paths.AddLanguagesToProject.Responses.$201> {
    if (requester.type !== 'human') {
      throw new BadRequestException('Invalid requester')
    }

    await this.projectService.addLanguagesToProject({
      projectId,
      requester,
      languageIds,
    })

    return {}
  }

  @Delete('/DeleteProject')
  async deleteProject(
    @Body() { projectId }: DeleteProjectDto,
    @AuthenticatedRequester() requester: Requester,
  ): Promise<Paths.DeleteProject.Responses.$204> {
    if (requester.type !== 'human') {
      throw new BadRequestException('Invalid requester')
    }

    await this.projectService.deleteProject({
      projectId,
      requester,
    })

    return {}
  }

  @Get('/ListProjects')
  async listProjects(
    @Query('workspaceId') workspaceId: string,
    @AuthenticatedRequester() requester: Requester,
    @Pagination() pagination: PaginationParams,
  ): Promise<Paths.ListProjects.Responses.$200> {
    if (requester.type !== 'human') {
      throw new BadRequestException('Invalid requester')
    }

    const result = await this.projectService.listProjects({
      workspaceId,
      requester,
      pagination,
    })

    return {
      items: result.items.map(ApiController.formatProject),
      pagination: result.pagination,
    }
  }

  @Get('/ListProjectRevisions')
  async listProjectRevisions(
    @Query('projectId') projectId: string,
    @Query('state') state: string,
    @AuthenticatedRequester() requester: Requester,
    @Pagination() pagination: PaginationParams,
  ): Promise<Paths.ListProjectRevisions.Responses.$200> {
    if (requester.type !== 'human') {
      throw new BadRequestException('Invalid requester')
    }

    if (state !== 'open' && state !== 'closed') {
      throw new BadRequestException('Invalid state')
    }

    const result = await this.projectService.listProjectRevisions({
      projectId,
      state,
      requester,
      pagination,
    })

    return {
      items: result.items.map(ApiController.formatProjectRevision),
      pagination: result.pagination,
    }
  }
}
