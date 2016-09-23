//-- copyright
// OpenProject is a project management system.
// Copyright (C) 2012-2015 the OpenProject Foundation (OPF)
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License version 3.
//
// OpenProject is a fork of ChiliProject, which is a fork of Redmine. The copyright follows:
// Copyright (C) 2006-2013 Jean-Philippe Lang
// Copyright (C) 2010-2013 the ChiliProject Team
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License
// as published by the Free Software Foundation; either version 2
// of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
//
// See doc/COPYRIGHT.rdoc for more details.
//++

import {wpDirectivesModule} from '../../../angular-modules';
import {WorkPackageCacheService} from '../../work-packages/work-package-cache.service';

export class WorkPackageRelationsHierarchyService {
  constructor(protected $state:ng.ui.IStateService,
              protected $q:ng.IQService,
              protected wpCacheService:WorkPackageCacheService) {

  }

  public changeParent(workPackage, parentId) {
    return workPackage.changeParent({
      parentId: parentId,
      lockVersion: workPackage.lockVersion
    });
  }

  public removeParent(workPackage) {
    return this.changeParent(workPackage, null);
  }

  public addExistingChildWp(workPackage, childWpId) {
    var deferred = this.$q.defer();
    this.wpCacheService.loadWorkPackage(childWpId)
      .take(1)
      .subscribe(wpToBecomeChild => {
        deferred.resolve(this.changeParent(wpToBecomeChild, workPackage.id));
      });

    return deferred.promise;
  }

  public addNewChildWp(workPackage) {
    workPackage.project.$load()
      .then(() => {
        const args = [
          'work-packages.list.new',
          {
            parent_id: workPackage.id,
            projectPath: workPackage.project.identifier
          }
        ];

        if (this.$state.includes('work-packages.show')) {
          args[0] = 'work-packages.new';
        }

        (<any>this.$state).go(...args);
      });
  }

  public removeChild(childWorkPackage) {
    childWorkPackage.parentId = null;
    return childWorkPackage.save();
  }


}

wpDirectivesModule.service('wpRelationsHierarchyService', WorkPackageRelationsHierarchyService);


