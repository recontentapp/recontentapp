import { Injectable } from '@nestjs/common'
import { Components } from 'src/generated/typeDefinitions'
import { Requester } from 'src/utils/requester'

@Injectable()
export class PermissionService {
  constructor() {}

  listRequesterPermissions(
    requester: Requester,
    workspaceId: string,
  ): Components.Schemas.WorkspacePermission[] {
    const permissions: Components.Schemas.WorkspacePermission[] = []
    const workspaceAccount = requester.getAccountForWorkspace(workspaceId)
    if (!workspaceAccount) {
      return permissions
    }

    return permissions
  }
}
