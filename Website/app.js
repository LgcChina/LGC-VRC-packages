const LISTING_URL = "{{ listingInfo.Url }}";

const PACKAGES = {
{{~ for package in packages ~}}
  "{{ package.Name }}": {
    name: "{{ package.Name }}",
    displayName: "{{ if package.DisplayName; package.DisplayName; end; }}",
    description: "{{ if package.Description; package.Description; end; }}",
    version: "{{ package.Version }}",
    author: {
      name: "{{ if package.Author.Name; package.Author.Name; end; }}",
      url: "{{ if package.Author.Url; package.Author.Url; end; }}",
    },
    dependencies: {
      {{~ for dependency in package.Dependencies ~}}
        "{{ dependency.Name }}": "{{ dependency.Version }}",
      {{~ end ~}}
    },
    keywords: [
      {{~ for keyword in package.Keywords ~}}
        "{{ keyword }}",
      {{~ end ~}}
    ],
    license: "{{ package.License }}",
    licensesUrl: "{{ package.LicensesUrl }}",
  },
{{~ end ~}}
};

// 修改点 2：替换 setTheme() 为空函数（新版本 FluentUI 不再支持 StandardLuminance）
const setTheme = () => {
  // FluentUI 新版本已不再支持 StandardLuminance
};

(() => {
  // 修改点 3：主题初始化包裹 try-catch
  try {
    setTheme();
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      setTheme();
    });
  } catch (err) {
    console.warn('Theme initialization skipped:', err);
  }

  // ----- 获取所有需要操作的 DOM 元素 -----
  const packageGrid = document.getElementById('packageGrid');
  const searchInput = document.getElementById('searchInput');
  const urlBarHelpButton = document.getElementById('urlBarHelp');
  const addListingToVccHelp = document.getElementById('addListingToVccHelp');
  const addListingToVccHelpClose = document.getElementById('addListingToVccHelpClose');
  const vccListingInfoUrlFieldCopy = document.getElementById('vccListingInfoUrlFieldCopy');
  const vccAddRepoButton = document.getElementById('vccAddRepoButton');
  const vccUrlFieldCopy = document.getElementById('vccUrlFieldCopy');
  const rowMoreMenu = document.getElementById('rowMoreMenu');
  const packageInfoModal = document.getElementById('packageInfoModal');
  const packageInfoModalClose = document.getElementById('packageInfoModalClose');
  const packageInfoListingHelp = document.getElementById('packageInfoListingHelp');

  // ----- 修改点 10：搜索功能仅在 packageGrid 和 searchInput 都存在时注册 -----
  if (searchInput && packageGrid) {
    searchInput.addEventListener('input', ({ target: { value = '' } }) => {
      const items = packageGrid.querySelectorAll('fluent-data-grid-row[row-type="default"]');
      items.forEach(item => {
        if (value === '') {
          item.style.display = 'grid';
          return;
        }
        if (
          item.dataset?.packageName?.toLowerCase()?.includes(value.toLowerCase()) ||
          item.dataset?.packageId?.toLowerCase()?.includes(value.toLowerCase())
        ) {
          item.style.display = 'grid';
        } else {
          item.style.display = 'none';
        }
      });
    });
  }

  // ----- 修改点 5：帮助按钮（显示弹窗）-----
  if (urlBarHelpButton && addListingToVccHelp) {
    urlBarHelpButton.addEventListener('click', () => {
      addListingToVccHelp.hidden = false;
    });
  }

  // ----- 修改点 6：帮助弹窗关闭按钮 -----
  if (addListingToVccHelpClose && addListingToVccHelp) {
    addListingToVccHelpClose.addEventListener('click', () => {
      addListingToVccHelp.hidden = true;
    });
  }

  // ----- 修改点 1（已修复）+ 修改点 16：vccListingInfoUrlFieldCopy 复制按钮（添加 ?.）-----
  if (vccListingInfoUrlFieldCopy) {
    vccListingInfoUrlFieldCopy.addEventListener('click', () => {
      const vccUrlField = document.getElementById('vccListingInfoUrlField');
      if (vccUrlField) {
        vccUrlField.select();
        navigator.clipboard?.writeText(vccUrlField.value);
        vccListingInfoUrlFieldCopy.appearance = 'accent';
        setTimeout(() => {
          vccListingInfoUrlFieldCopy.appearance = 'neutral';
        }, 1000);
      }
    });
  }

  // ----- 修改点 7：VCC 添加仓库按钮 -----
  if (vccAddRepoButton) {
    vccAddRepoButton.addEventListener('click', () =>
      window.location.assign(`vcc://vpm/addRepo?url=${encodeURIComponent(LISTING_URL)}`)
    );
  }

  // ----- 修改点 16：vccUrlFieldCopy 复制按钮（添加 ?.）-----
  if (vccUrlFieldCopy) {
    vccUrlFieldCopy.addEventListener('click', () => {
      const vccUrlField = document.getElementById('vccUrlField');
      if (vccUrlField) {
        vccUrlField.select();
        navigator.clipboard?.writeText(vccUrlField.value);
        vccUrlFieldCopy.appearance = 'accent';
        setTimeout(() => {
          vccUrlFieldCopy.appearance = 'neutral';
        }, 1000);
      }
    });
  }

  // ----- 修改点 11 + 修改点 13 + 修改点 14 + 修改点 15：rowMoreMenu 相关逻辑 -----
  const hideRowMoreMenu = e => {
    if (!rowMoreMenu) return;
    if (rowMoreMenu.contains(e.target)) return;
    document.removeEventListener('click', hideRowMoreMenu);
    rowMoreMenu.hidden = true;
  };

  const rowMenuButtons = document.querySelectorAll('.rowMenuButton');
  rowMenuButtons.forEach(button => {
    button.addEventListener('click', e => {
      if (rowMoreMenu?.hidden) {
        // 修改点 13：使用 currentTarget 获取坐标
        const rect = e.currentTarget.getBoundingClientRect();
        rowMoreMenu.style.top = `${rect.bottom + window.scrollY}px`;
        rowMoreMenu.style.left = `${rect.left + window.scrollX - 120}px`;
        rowMoreMenu.hidden = false;

        const downloadLink = rowMoreMenu.querySelector('#rowMoreMenuDownload');
        if (downloadLink) {
          // 修改点 15：直接使用 onclick 代替 addEventListener，避免移除问题
          downloadLink.onclick = () => {
            // 修改点 14：使用 currentTarget 获取数据
            window.open(
              e.currentTarget?.dataset?.packageUrl,
              '_blank'
            );
          };
        }

        setTimeout(() => {
          document.addEventListener('click', hideRowMoreMenu);
        }, 1);
      }
    });
  });

  // ----- 修改点 8：packageInfoModal 关闭按钮 -----
  if (packageInfoModal && packageInfoModalClose) {
    packageInfoModalClose.addEventListener('click', () => {
      packageInfoModal.hidden = true;
    });
  }

  // ----- 修改点 2（续）：安全访问 modalControl 并设置样式 -----
  const modalControl = packageInfoModal?.shadowRoot?.querySelector('.control');
  if (modalControl) {
    modalControl.style.maxHeight = "90%";
    modalControl.style.transition = 'height 0.2s ease-in-out';
    modalControl.style.overflowY = 'hidden';
  }

  // ----- 获取 packageInfo 弹窗内的元素 -----
  const packageInfoName = document.getElementById('packageInfoName');
  const packageInfoId = document.getElementById('packageInfoId');
  const packageInfoVersion = document.getElementById('packageInfoVersion');
  const packageInfoDescription = document.getElementById('packageInfoDescription');
  const packageInfoAuthor = document.getElementById('packageInfoAuthor');
  const packageInfoDependencies = document.getElementById('packageInfoDependencies');
  const packageInfoKeywords = document.getElementById('packageInfoKeywords');
  const packageInfoLicense = document.getElementById('packageInfoLicense');

  // ----- 行内按钮：添加到 VCC -----
  const rowAddToVccButtons = document.querySelectorAll('.rowAddToVccButton');
  rowAddToVccButtons.forEach((button) => {
    button.addEventListener('click', () =>
      window.location.assign(`vcc://vpm/addRepo?url=${encodeURIComponent(LISTING_URL)}`)
    );
  });

  // ----- 行内按钮：查看包信息（修改点 12、17、18）-----
  const rowPackageInfoButton = document.querySelectorAll('.rowPackageInfoButton');
  rowPackageInfoButton.forEach((button) => {
    button.addEventListener('click', e => {
      // 修改点 12：使用 currentTarget 获取 dataset
      const packageId = e.currentTarget?.dataset?.packageId;
      const packageInfo = PACKAGES?.[packageId];
      if (!packageInfo) {
        console.error(`Did not find package ${packageId}. Packages available:`, PACKAGES);
        return;
      }

      // 填充基本信息
      if (packageInfoName) packageInfoName.textContent = packageInfo.displayName;
      if (packageInfoId) packageInfoId.textContent = packageId;
      if (packageInfoVersion) packageInfoVersion.textContent = `v${packageInfo.version}`;
      if (packageInfoDescription) packageInfoDescription.textContent = packageInfo.description;
      if (packageInfoAuthor) {
        packageInfoAuthor.textContent = packageInfo.author.name;
        packageInfoAuthor.href = packageInfo.author.url;
      }

      // 修改点 17：关键词遍历防御
      if (packageInfoKeywords) {
        const keywords = packageInfo.keywords ?? [];
        if (keywords.length === 0) {
          packageInfoKeywords.parentElement?.classList.add('hidden');
        } else {
          packageInfoKeywords.parentElement?.classList.remove('hidden');
          packageInfoKeywords.innerHTML = null;
          keywords.forEach(keyword => {
            const keywordDiv = document.createElement('div');
            keywordDiv.classList.add('me-2', 'mb-2', 'badge');
            keywordDiv.textContent = keyword;
            packageInfoKeywords.appendChild(keywordDiv);
          });
        }
      }

      // 许可证
      if (packageInfoLicense) {
        if (!packageInfo.license?.length && !packageInfo.licensesUrl?.length) {
          packageInfoLicense.parentElement?.classList.add('hidden');
        } else {
          packageInfoLicense.parentElement?.classList.remove('hidden');
          packageInfoLicense.textContent = packageInfo.license ?? 'See License';
          packageInfoLicense.href = packageInfo.licensesUrl ?? '#';
        }
      }

      // 修改点 18：依赖遍历防御
      if (packageInfoDependencies) {
        packageInfoDependencies.innerHTML = null;
        const deps = packageInfo.dependencies ?? {};
        Object.entries(deps).forEach(([name, version]) => {
          const depRow = document.createElement('li');
          depRow.classList.add('mb-2');
          depRow.textContent = `${name} @ v${version}`;
          packageInfoDependencies.appendChild(depRow);
        });
      }

      // 显示弹窗
      if (packageInfoModal) {
        packageInfoModal.hidden = false;

        // 安全设置对话框高度
        setTimeout(() => {
          if (!modalControl) return;
          const height = packageInfoModal.querySelector('.col')?.clientHeight ?? 0;
          modalControl.style.setProperty('--dialog-height', `${height + 14}px`);
        }, 1);
      }
    });
  });

  // ----- 修改点 4 + 修改点 16：packageInfoVccUrlFieldCopy 复制按钮（添加 ?.）-----
  const packageInfoVccUrlFieldCopy = document.getElementById('packageInfoVccUrlFieldCopy');
  if (packageInfoVccUrlFieldCopy) {
    packageInfoVccUrlFieldCopy.addEventListener('click', () => {
      const vccUrlField = document.getElementById('packageInfoVccUrlField');
      if (vccUrlField) {
        vccUrlField.select();
        navigator.clipboard?.writeText(vccUrlField.value);
        packageInfoVccUrlFieldCopy.appearance = 'accent';
        setTimeout(() => {
          packageInfoVccUrlFieldCopy.appearance = 'neutral';
        }, 1000);
      }
    });
  }

  // ----- 修改点 9：弹窗内的帮助链接 -----
  if (packageInfoListingHelp && addListingToVccHelp) {
    packageInfoListingHelp.addEventListener('click', () => {
      addListingToVccHelp.hidden = false;
    });
  }
})();
