import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  ParseFilePipeBuilder,
  Post,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { Response } from 'express'
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
  DeleteWorkspaceServiceAccountDto,
  InviteToWorkspaceDto,
  JoinWorkspaceDto,
} from './dto/workspace.dto'
import { WorkspaceService } from 'src/modules/workspace/workspace.service'
import {
  Language,
  Phrase,
  PhraseTranslation,
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
import { PhraseService } from 'src/modules/phrase/phrase.service'
import {
  BatchDeletePhraseDto,
  CreatePhraseDto,
  DeletePhraseDto,
  GeneratePhrasesExportLinkDto,
  ImportPhrasesDto,
  TranslatePhraseDto,
  UpdatePhraseKeyDto,
} from './dto/phrase.dto'
import { RequiredQuery } from 'src/utils/required-query'
import { FileInterceptor } from '@nestjs/platform-express'

@Controller('private-api')
@UseGuards(JwtAuthGuard)
export class PrivateApiController {
  constructor(
    private readonly authService: AuthService,
    private readonly workspaceService: WorkspaceService,
    private readonly projectService: ProjectService,
    private readonly phraseService: PhraseService,
    private readonly prismaService: PrismaService,
  ) {}

  private static formatPhraseItem(
    phrase: Phrase,
  ): Components.Schemas.PhraseItem {
    return {
      id: phrase.id,
      key: phrase.key,
      revisionId: phrase.revisionId,
      projectId: phrase.projectId,
      workspaceId: phrase.workspaceId,
      createdAt: phrase.createdAt.toISOString(),
      updatedAt: phrase.updatedAt.toISOString(),
      createdBy: phrase.createdBy,
      updatedBy: phrase.updatedBy,
    }
  }

  private static formatPhrase(
    phrase: Phrase & { translations: PhraseTranslation[] },
  ): Components.Schemas.Phrase {
    return {
      id: phrase.id,
      key: phrase.key,
      revisionId: phrase.revisionId,
      projectId: phrase.projectId,
      workspaceId: phrase.workspaceId,
      translations: phrase.translations.map(t => ({
        id: t.id,
        languageId: t.languageId,
        content: t.content,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
        createdBy: t.createdBy,
        updatedBy: t.updatedBy,
      })),
      createdAt: phrase.createdAt.toISOString(),
      updatedAt: phrase.updatedAt.toISOString(),
      createdBy: phrase.createdBy,
      updatedBy: phrase.updatedBy,
    }
  }

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
        workspace: PrivateApiController.formatWorkspace(account.workspace),
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
    project: Project & { languages: Language[]; revisions: ProjectRevision[] },
  ): Components.Schemas.Project {
    return {
      id: project.id,
      workspaceId: project.workspaceId,
      // TODO: How to enforce presence?
      masterRevisionId: project.revisions.find(r => r.isMaster)?.id ?? '',
      name: project.name,
      description: project.description,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
      createdBy: project.createdBy,
      updatedBy: project.updatedBy,
      languages: project.languages.map(PrivateApiController.formatLanguage),
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

  @Throttle({ default: { limit: 10, ttl: 1000 } })
  @Get('/system')
  @Public()
  async settings() {
    const signUpDisabledRequested = process.env.SIGN_UP_DISABLED === 'true'
    let signUpDisabled = false

    if (signUpDisabledRequested) {
      const user = await this.prismaService.user.findFirst()
      signUpDisabled = !!user
    }

    return {
      version: process.env.APP_VERSION ?? '0.0.0',
      distribution: process.env.APP_DISTRIBUTION ?? 'self-hosted',
      settings: {
        signUpDisabled,
      },
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

    return PrivateApiController.formatCurrentUser(user)
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

    return PrivateApiController.formatCurrentUser(user)
  }

  @Get('/GetWorkspaceAvailability')
  async getWorkspaceAvailability(
    @RequiredQuery('key') key: string,
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

    return PrivateApiController.formatWorkspace(workspace)
  }

  @Get('/GetWorkspace')
  async getWorkspace(
    @RequiredQuery('id') id: string,
    @AuthenticatedRequester() requester: Requester,
  ): Promise<Paths.GetWorkspace.Responses.$200> {
    const workspace = await this.workspaceService.getWorkspace({
      workspaceId: id,
      requester,
    })

    return PrivateApiController.formatWorkspace(workspace)
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

  @Get('/ListWorkspaceInvitations')
  async listWorkspaceInvitations(
    @RequiredQuery('workspaceId') workspaceId: string,
    @AuthenticatedRequester() requester: Requester,
    @Pagination() pagination: PaginationParams,
  ): Promise<Paths.ListWorkspaceInvitations.Responses.$200> {
    if (requester.type !== 'human') {
      throw new BadRequestException('Invalid requester')
    }

    const invitations = await this.workspaceService.listWorkspaceInvitations({
      workspaceId,
      requester,
      pagination,
    })

    return invitations
  }

  @Get('/ListWorkspaceAccounts')
  async listWorkspaceAccounts(
    @RequiredQuery('workspaceId') workspaceId: string,
    @RequiredQuery('type') type: string,
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

    const apiKey = await this.workspaceService.createWorkspaceServiceAccount({
      workspaceId,
      requester,
      name,
      role,
    })

    return { apiKey }
  }

  @Delete('/DeleteWorkspaceServiceAccount')
  async deleteWorkspaceServiceAccount(
    @Body() { id }: DeleteWorkspaceServiceAccountDto,
    @AuthenticatedRequester() requester: Requester,
  ): Promise<Paths.DeleteWorkspaceServiceAccount.Responses.$204> {
    if (requester.type !== 'human') {
      throw new BadRequestException('Invalid requester')
    }

    await this.workspaceService.deleteWorkspaceServiceAccount({
      id,
      requester,
    })

    return {}
  }

  @Get('/ListWorkspaceLanguages')
  async listWorkspaceLanguages(
    @RequiredQuery('workspaceId') workspaceId: string,
    @AuthenticatedRequester() requester: Requester,
  ): Promise<Paths.ListWorkspaceLanguages.Responses.$200> {
    const languages = await this.workspaceService.listWorkspaceLanguages({
      workspaceId,
      requester,
    })

    return languages.map(PrivateApiController.formatLanguage)
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

    return PrivateApiController.formatProject(project)
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

    return PrivateApiController.formatProject(project)
  }

  @Get('/GetProject')
  async getProject(
    @RequiredQuery('id') id: string,
    @AuthenticatedRequester() requester: Requester,
  ): Promise<Paths.GetProject.Responses.$200> {
    if (requester.type !== 'human') {
      throw new BadRequestException('Invalid requester')
    }

    const project = await this.projectService.getProject({
      projectId: id,
      requester,
    })

    return PrivateApiController.formatProject(project)
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
    @RequiredQuery('workspaceId') workspaceId: string,
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
      items: result.items.map(PrivateApiController.formatProject),
      pagination: result.pagination,
    }
  }

  @Get('/ListProjectRevisions')
  async listProjectRevisions(
    @RequiredQuery('projectId') projectId: string,
    @RequiredQuery('state') state: string,
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
      items: result.items.map(PrivateApiController.formatProjectRevision),
      pagination: result.pagination,
    }
  }

  @Get('/GetProjectRevision')
  async getProjectRevision(
    @RequiredQuery('revisionId') revisionId: string,
    @AuthenticatedRequester() requester: Requester,
  ): Promise<Paths.GetProjectRevision.Responses.$200> {
    if (requester.type !== 'human') {
      throw new BadRequestException('Invalid requester')
    }

    const revision = await this.projectService.getProjectRevision({
      revisionId,
      requester,
    })

    return PrivateApiController.formatProjectRevision(revision)
  }

  @Get('/GetReferenceableAccounts')
  async getReferenceableAccounts(
    @RequiredQuery('workspaceId') workspaceId: string,
    @AuthenticatedRequester() requester: Requester,
  ): Promise<Paths.GetReferenceableAccounts.Responses.$200> {
    const accounts = await this.workspaceService.getReferenceableAccounts({
      workspaceId,
      requester,
    })

    return { accounts }
  }

  @Get('/ListPhrases')
  async listPhrases(
    @RequiredQuery('revisionId') revisionId: string,
    @AuthenticatedRequester() requester: Requester,
    @Pagination() pagination: PaginationParams,
    @Query('key') key?: string,
    @Query('translated') translated?: string,
    @Query('untranslated') untranslated?: string,
  ): Promise<Paths.ListPhrases.Responses.$200> {
    if (requester.type !== 'human') {
      throw new BadRequestException('Invalid requester')
    }

    const result = await this.phraseService.listPhrases({
      revisionId,
      key,
      translated,
      untranslated,
      requester,
      pagination,
    })

    return {
      items: result.items.map(PrivateApiController.formatPhraseItem),
      pagination: result.pagination,
    }
  }

  @Post('/CreatePhrase')
  async createPhrase(
    @Body() { revisionId, key }: CreatePhraseDto,
    @AuthenticatedRequester() requester: Requester,
  ): Promise<Paths.CreatePhrase.Responses.$201> {
    if (requester.type !== 'human') {
      throw new BadRequestException('Invalid requester')
    }

    const phrase = await this.phraseService.createPhrase({
      revisionId,
      key,
      requester,
    })

    return PrivateApiController.formatPhrase(phrase)
  }

  @Get('/GetPhrase')
  async getPhrase(
    @RequiredQuery('phraseId') phraseId: string,
    @AuthenticatedRequester() requester: Requester,
  ): Promise<Paths.GetPhrase.Responses.$200> {
    if (requester.type !== 'human') {
      throw new BadRequestException('Invalid requester')
    }

    const phrase = await this.phraseService.getPhrase({
      phraseId,
      requester,
    })

    return PrivateApiController.formatPhrase(phrase)
  }

  @Post('/UpdatePhraseKey')
  async updatePhraseKey(
    @Body() { phraseId, key }: UpdatePhraseKeyDto,
    @AuthenticatedRequester() requester: Requester,
  ): Promise<Paths.UpdatePhraseKey.Responses.$200> {
    if (requester.type !== 'human') {
      throw new BadRequestException('Invalid requester')
    }

    const phrase = await this.phraseService.updatePhraseKey({
      phraseId,
      key,
      requester,
    })

    return PrivateApiController.formatPhrase(phrase)
  }

  @Post('/TranslatePhrase')
  async translatePhrase(
    @Body() { phraseId, translations }: TranslatePhraseDto,
    @AuthenticatedRequester() requester: Requester,
  ): Promise<Paths.TranslatePhrase.Responses.$200> {
    if (requester.type !== 'human') {
      throw new BadRequestException('Invalid requester')
    }

    const phrase = await this.phraseService.translatePhrase({
      phraseId,
      translations,
      requester,
    })

    return PrivateApiController.formatPhrase(phrase)
  }

  @Delete('/BatchDeletePhrase')
  async batchDeletePhrase(
    @Body() { ids }: BatchDeletePhraseDto,
    @AuthenticatedRequester() requester: Requester,
  ): Promise<Paths.BatchDeletePhrase.Responses.$204> {
    if (requester.type !== 'human') {
      throw new BadRequestException('Invalid requester')
    }

    await this.phraseService.batchDeletePhrases({
      ids,
      requester,
    })

    return {}
  }

  @Delete('/DeletePhrase')
  async deletePhrase(
    @Body() { phraseId }: DeletePhraseDto,
    @AuthenticatedRequester() requester: Requester,
  ): Promise<Paths.DeleteProject.Responses.$204> {
    if (requester.type !== 'human') {
      throw new BadRequestException('Invalid requester')
    }

    await this.phraseService.deletePhrase({
      phraseId,
      requester,
    })

    return {}
  }

  @Post('/ImportPhrases')
  @UseInterceptors(FileInterceptor('file'))
  async importPhrases(
    @AuthenticatedRequester() requester: Requester,
    @Body() body: ImportPhrasesDto,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({
          maxSize: 5e6, // 5MB
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
  ): Promise<Paths.ImportPhrases.Responses.$201> {
    if (requester.type !== 'human') {
      throw new BadRequestException('Invalid requester')
    }

    await this.phraseService.importPhrases({
      file: file.buffer,
      fileFormat: body.fileFormat,
      revisionId: body.revisionId,
      languageId: body.languageId,
      mappingSheetName: body.mappingSheetName,
      mappingKeyColumnIndex: body.mappingKeyColumnIndex
        ? Number(body.mappingKeyColumnIndex)
        : undefined,
      mappingRowStartIndex: body.mappingRowStartIndex
        ? Number(body.mappingRowStartIndex)
        : undefined,
      mappingTranslationColumnIndex: body.mappingTranslationColumnIndex
        ? Number(body.mappingTranslationColumnIndex)
        : undefined,
      requester,
    })

    return {}
  }

  @Post('/GeneratePhrasesExportLink')
  async generatePhrasesExportLink(
    @AuthenticatedRequester() requester: Requester,
    @Body()
    {
      revisionId,
      languageId,
      fileFormat,
      includeEmptyTranslations,
    }: GeneratePhrasesExportLinkDto,
  ): Promise<Paths.GeneratePhrasesExportLink.Responses.$201> {
    if (requester.type !== 'human') {
      throw new BadRequestException('Invalid requester')
    }

    const token = await this.phraseService.generatePhrasesExportToken({
      revisionId,
      languageId,
      fileFormat,
      includeEmptyTranslations,
      requester,
    })

    return {
      link: `${process.env.API_URL}/private-api/GetPhrasesExport?token=${token}`,
    }
  }

  @Public()
  @Throttle({ default: { limit: 1, ttl: 1000 } })
  @Get('/GetPhrasesExport')
  async getPhrasesExport(
    @RequiredQuery('token') token: string,
    @Res() response: Response,
  ) {
    const { buffer, contentType, fileName } =
      await this.phraseService.exportPhrases({
        token,
      })

    response.set({
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${fileName}"`,
    })
    response.send(buffer)
  }
}
