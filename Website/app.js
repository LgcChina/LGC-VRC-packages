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

const setTheme = () => {};

(() => {
  try {
    setTheme();
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      setTheme();
    });
  } catch (err) {
    console.warn('Theme initialization skipped:', err);
  }

  function openDialog(dialog) {
    if (!dialog) return;
    document.querySelectorAll('fluent-dialog').forEach(d => {
      if (d !== dialog && d.open) {
        d.open = false;
      }
    });
    dialog.open = true;
  }

  function closeDialog(dialog) {
    if (!dialog) return;
    dialog.open = false;
  }

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

  const publishedByTooltip = document.getElementById('publishedByTooltip');
  const publishedByText = document.getElementById('publishedByText');
  if (publishedByTooltip && publishedByText) {
    publishedByTooltip.anchorElement = publishedByText;
  }

  const packageInfoListingTooltip = document.getElementById('packageInfoListingTooltip');
  if (packageInfoListingTooltip && packageInfoListingHelp) {
    packageInfoListingTooltip.anchorElement = packageInfoListingHelp;
  }

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

  if (urlBarHelpButton && addListingToVccHelp) {
    urlBarHelpButton.addEventListener('click', () => {
      openDialog(addListingToVccHelp);
    });
  }

  if (addListingToVccHelpClose && addListingToVccHelp) {
    addListingToVccHelpClose.addEventListener('click', () => {
      closeDialog(addListingToVccHelp);
    });
  }

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

  if (vccAddRepoButton) {
    vccAddRepoButton.addEventListener('click', () =>
      window.location.assign(`vcc://vpm/addRepo?url=${encodeURIComponent(LISTING_URL)}`)
    );
  }

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
        const rect = e.currentTarget.getBoundingClientRect();
        rowMoreMenu.style.top = `${rect.bottom + window.scrollY}px`;
        rowMoreMenu.style.left = `${rect.left + window.scrollX - 120}px`;
        rowMoreMenu.hidden = false;

        const downloadLink = rowMoreMenu.querySelector('#rowMoreMenuDownload');
        if (downloadLink) {
          downloadLink.onclick = () => {
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

  if (packageInfoModal && packageInfoModalClose) {
    packageInfoModalClose.addEventListener('click', () => {
      closeDialog(packageInfoModal);
    });
  }

  const modalControl = packageInfoModal?.shadowRoot?.querySelector('.control');
  if (modalControl) {
    modalControl.style.maxHeight = "90%";
    modalControl.style.transition = 'height 0.2s ease-in-out';
    modalControl.style.overflowY = 'hidden';
  }

  const packageInfoName = document.getElementById('packageInfoName');
  const packageInfoId = document.getElementById('packageInfoId');
  const packageInfoVersion = document.getElementById('packageInfoVersion');
  const packageInfoDescription = document.getElementById('packageInfoDescription');
  const packageInfoAuthor = document.getElementById('packageInfoAuthor');
  const packageInfoDependencies = document.getElementById('packageInfoDependencies');
  const packageInfoKeywords = document.getElementById('packageInfoKeywords');
  const packageInfoLicense = document.getElementById('packageInfoLicense');

  document.querySelectorAll('.rowAddToVccButton').forEach((button) => {
    button.addEventListener('click', () =>
      window.location.assign(`vcc://vpm/addRepo?url=${encodeURIComponent(LISTING_URL)}`)
    );
  });

  document.querySelectorAll('.rowPackageInfoButton').forEach((button) => {
    button.addEventListener('click', e => {
      const packageId = e.currentTarget?.dataset?.packageId;
      const packageInfo = PACKAGES?.[packageId];
      if (!packageInfo) {
        console.error(`Did not find package ${packageId}. Packages available:`, PACKAGES);
        return;
      }

      if (packageInfoName) packageInfoName.textContent = packageInfo.displayName;
      if (packageInfoId) packageInfoId.textContent = packageId;
      if (packageInfoVersion) packageInfoVersion.textContent = `v${packageInfo.version}`;
      if (packageInfoDescription) packageInfoDescription.textContent = packageInfo.description;
      if (packageInfoAuthor) {
        packageInfoAuthor.textContent = packageInfo.author.name;
        packageInfoAuthor.href = packageInfo.author.url;
      }

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

      if (packageInfoLicense) {
        if (!packageInfo.license?.length && !packageInfo.licensesUrl?.length) {
          packageInfoLicense.parentElement?.classList.add('hidden');
        } else {
          packageInfoLicense.parentElement?.classList.remove('hidden');
          packageInfoLicense.textContent = packageInfo.license ?? 'See License';
          packageInfoLicense.href = packageInfo.licensesUrl ?? '#';
        }
      }

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

      if (packageInfoModal) {
        openDialog(packageInfoModal);
        setTimeout(() => {
          if (!modalControl) return;
          const height = packageInfoModal.querySelector('.col')?.clientHeight ?? 0;
          modalControl.style.setProperty('--dialog-height', `${height + 14}px`);
        }, 50);
      }
    });
  });

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

  if (packageInfoListingHelp && addListingToVccHelp) {
    packageInfoListingHelp.addEventListener('click', () => {
      openDialog(addListingToVccHelp);
    });
  }
})();
