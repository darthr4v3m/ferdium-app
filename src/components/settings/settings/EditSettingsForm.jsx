import { systemPreferences } from '@electron/remote';
import { Component } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import prettyBytes from 'pretty-bytes';
import { defineMessages, injectIntl } from 'react-intl';

import { mdiGithub, mdiOpenInNew, mdiPowerPlug } from '@mdi/js';

import Form from '../../../lib/Form';
import Button from '../../ui/button';
import Toggle from '../../ui/Toggle';
import Select from '../../ui/Select';
import Input from '../../ui/Input';
import ColorPickerInput from '../../ui/ColorPickerInput';
import Infobox from '../../ui/Infobox';
import { H1, H2, H3, H5 } from '../../ui/headline';
import {
  ferdiumVersion,
  userDataPath,
  userDataRecipesPath,
} from '../../../environment-remote';

import { updateVersionParse } from '../../../helpers/update-helpers';

import {
  DEFAULT_ACCENT_COLOR,
  DEFAULT_APP_SETTINGS,
  FERDIUM_TRANSLATION,
  GITHUB_FRANZ_URL,
  SPLIT_COLUMNS_MAX,
  SPLIT_COLUMNS_MIN,
} from '../../../config';
import { isMac, isWindows, lockFerdiumShortcutKey } from '../../../environment';
import { openExternalUrl, openPath } from '../../../helpers/url-helpers';
import globalMessages from '../../../i18n/globalMessages';
import Icon from '../../ui/icon';
import Slider from '../../ui/Slider';

const debug = require('../../../preload-safe-debug')(
  'Ferdium:EditSettingsForm',
);

const messages = defineMessages({
  headlineGeneral: {
    id: 'settings.app.headlineGeneral',
    defaultMessage: 'General',
  },
  headlineServices: {
    id: 'settings.app.headlineServices',
    defaultMessage: 'Services',
  },
  hibernateInfo: {
    id: 'settings.app.hibernateInfo',
    defaultMessage:
      'By default, Ferdium will keep all your services open and loaded in the background so they are ready when you want to use them. Service Hibernation will unload your services after a specified amount. This is useful to save RAM or keeping services from slowing down your computer.',
  },
  inactivityLockInfo: {
    id: 'settings.app.inactivityLockInfo',
    defaultMessage:
      'Minutes of inactivity, after which Ferdium should automatically lock. Use 0 to disable',
  },
  todoServerInfo: {
    id: 'settings.app.todoServerInfo',
    defaultMessage: 'This server will be used for the "Ferdium Todo" feature.',
  },
  lockedPassword: {
    id: 'settings.app.lockedPassword',
    defaultMessage: 'Password',
  },
  lockedPasswordInfo: {
    id: 'settings.app.lockedPasswordInfo',
    defaultMessage:
      "Please make sure to set a password you'll remember.\nIf you loose this password, you will have to reinstall Ferdium.",
  },
  lockInfo: {
    id: 'settings.app.lockInfo',
    defaultMessage:
      'Password Lock allows you to keep your messages protected.\nUsing Password Lock, you will be prompted to enter your password everytime you start Ferdium or lock Ferdium yourself using the lock symbol in the bottom left corner or the shortcut {lockShortcut}.',
  },
  scheduledDNDTimeInfo: {
    id: 'settings.app.scheduledDNDTimeInfo',
    defaultMessage:
      'Times in 24-Hour-Format. End time can be before start time (e.g. start 17:00, end 09:00) to enable Do-not-Disturb overnight.',
  },
  scheduledDNDInfo: {
    id: 'settings.app.scheduledDNDInfo',
    defaultMessage:
      'Scheduled Do-not-Disturb allows you to define a period of time in which you do not want to get Notifications from Ferdium.',
  },
  headlineLanguage: {
    id: 'settings.app.headlineLanguage',
    defaultMessage: 'Language',
  },
  headlineUpdates: {
    id: 'settings.app.headlineUpdates',
    defaultMessage: 'Updates',
  },
  headlineAppearance: {
    id: 'settings.app.headlineAppearance',
    defaultMessage: 'Appearance',
  },
  sectionMain: {
    id: 'settings.app.sectionMain',
    defaultMessage: 'Main',
  },
  sectionHibernation: {
    id: 'settings.app.sectionHibernation',
    defaultMessage: 'Hibernation',
  },
  sectionGeneralUi: {
    id: 'settings.app.sectionGeneralUi',
    defaultMessage: 'General UI',
  },
  sectionSidebarSettings: {
    id: 'settings.app.sectionSidebarSettings',
    defaultMessage: 'Sidebar Settings',
  },
  sectionPrivacy: {
    id: 'settings.app.sectionPrivacy',
    defaultMessage: 'Privacy Settings',
  },
  sectionLanguage: {
    id: 'settings.app.sectionLanguage',
    defaultMessage: 'Language Settings',
  },
  sectionAdvanced: {
    id: 'settings.app.sectionAdvanced',
    defaultMessage: 'Advanced Settings',
  },
  sectionUpdates: {
    id: 'settings.app.sectionUpdates',
    defaultMessage: 'App Updates Settings',
  },
  sectionServiceIconsSettings: {
    id: 'settings.app.sectionServiceIconsSettings',
    defaultMessage: 'Service Icons Settings',
  },
  sectionAccentColorSettings: {
    id: 'settings.app.sectionAccentColorSettings',
    defaultMessage: 'Accent Color Settings',
  },
  accentColorInfo: {
    id: 'settings.app.accentColorInfo',
    defaultMessage:
      'Write your color choice in a CSS-compatible format. (Default: {defaultAccentColor} or clear the input field)',
  },
  overallTheme: {
    id: 'settings.app.overallTheme',
    defaultMessage: 'Overall Theme',
  },
  progressbarTheme: {
    id: 'settings.app.progressbarTheme',
    defaultMessage: 'Progressbar Theme',
  },
  universalDarkModeInfo: {
    id: 'settings.app.universalDarkModeInfo',
    defaultMessage:
      'Universal Dark Mode tries to dynamically generate dark mode styles for services that are otherwise not currently supported.',
  },
  headlinePrivacy: {
    id: 'settings.app.headlinePrivacy',
    defaultMessage: 'Privacy',
  },
  headlineAdvanced: {
    id: 'settings.app.headlineAdvanced',
    defaultMessage: 'Advanced',
  },
  translationHelp: {
    id: 'settings.app.translationHelp',
    defaultMessage: 'Help us to translate Ferdium into your language.',
  },
  spellCheckerLanguageInfo: {
    id: 'settings.app.spellCheckerLanguageInfo',
    defaultMessage:
      "Ferdium uses your Mac's build-in spellchecker to check for typos. If you want to change the languages the spellchecker checks for, you can do so in your Mac's System Preferences.",
  },
  subheadlineCache: {
    id: 'settings.app.subheadlineCache',
    defaultMessage: 'Cache',
  },
  cacheInfo: {
    id: 'settings.app.cacheInfo',
    defaultMessage: 'Ferdium cache is currently using {size} of disk space.',
  },
  cacheNotCleared: {
    id: 'settings.app.cacheNotCleared',
    defaultMessage: "Couldn't clear all cache",
  },
  buttonClearAllCache: {
    id: 'settings.app.buttonClearAllCache',
    defaultMessage: 'Clear cache',
  },
  subheadlineFerdiumProfile: {
    id: 'settings.app.subheadlineFerdiumProfile',
    defaultMessage: 'Ferdium Profile',
  },
  buttonOpenFerdiumProfileFolder: {
    id: 'settings.app.buttonOpenFerdiumProfileFolder',
    defaultMessage: 'Open Profile folder',
  },
  buttonOpenFerdiumServiceRecipesFolder: {
    id: 'settings.app.buttonOpenFerdiumServiceRecipesFolder',
    defaultMessage: 'Open Service Recipes folder',
  },
  buttonOpenImportExport: {
    id: 'settings.app.buttonOpenImportExport',
    defaultMessage: 'Import / Export',
  },
  serverHelp: {
    id: 'settings.app.serverHelp',
    defaultMessage: 'Connected to server at {serverURL}',
  },
  buttonSearchForUpdate: {
    id: 'settings.app.buttonSearchForUpdate',
    defaultMessage: 'Check for updates',
  },
  buttonInstallUpdate: {
    id: 'settings.app.buttonInstallUpdate',
    defaultMessage: 'Restart & install update',
  },
  buttonShowChangelog: {
    id: 'settings.app.buttonShowChangelog',
    defaultMessage: 'Show changelog',
  },
  updateStatusSearching: {
    id: 'settings.app.updateStatusSearching',
    defaultMessage: 'Searching for updates...',
  },
  updateStatusAvailable: {
    id: 'settings.app.updateStatusAvailable',
    defaultMessage: 'Update available, downloading...',
  },
  updateStatusUpToDate: {
    id: 'settings.app.updateStatusUpToDate',
    defaultMessage: 'You are using the latest version of Ferdium',
  },
  currentVersion: {
    id: 'settings.app.currentVersion',
    defaultMessage: 'Current version:',
  },
  appRestartRequired: {
    id: 'settings.app.restartRequired',
    defaultMessage: 'Changes require restart',
  },
  servicesUpdated: {
    id: 'infobar.servicesUpdated',
    defaultMessage: 'Your services have been updated.',
  },
  buttonReloadServices: {
    id: 'infobar.buttonReloadServices',
    defaultMessage: 'Reload services',
  },
  numberOfColumns: {
    id: 'settings.app.form.splitColumns',
    defaultMessage: 'Number of columns',
  },
});

const Hr = () => (
  <hr
    className="settings__hr"
    style={{ marginBottom: 20, borderStyle: 'dashed' }}
  />
);
const HrSections = () => (
  <hr
    className="settings__hr-sections"
    style={{ marginTop: 20, marginBottom: 40, borderStyle: 'solid' }}
  />
);

class EditSettingsForm extends Component {
  static propTypes = {
    checkForUpdates: PropTypes.func.isRequired,
    installUpdate: PropTypes.func.isRequired,
    form: PropTypes.instanceOf(Form).isRequired,
    onSubmit: PropTypes.func.isRequired,
    isCheckingForUpdates: PropTypes.bool.isRequired,
    isUpdateAvailable: PropTypes.bool.isRequired,
    noUpdateAvailable: PropTypes.bool.isRequired,
    updateIsReadyToInstall: PropTypes.bool.isRequired,
    updateFailed: PropTypes.bool.isRequired,
    isClearingAllCache: PropTypes.bool.isRequired,
    onClearAllCache: PropTypes.func.isRequired,
    getCacheSize: PropTypes.func.isRequired,
    isTodosActivated: PropTypes.bool.isRequired,
    automaticUpdates: PropTypes.bool.isRequired,
    isDarkmodeEnabled: PropTypes.bool.isRequired,
    isAdaptableDarkModeEnabled: PropTypes.bool.isRequired,
    isUseGrayscaleServicesEnabled: PropTypes.bool.isRequired,
    openProcessManager: PropTypes.func.isRequired,
    isSplitModeEnabled: PropTypes.bool.isRequired,
    isOnline: PropTypes.bool.isRequired,
    serverURL: PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      activeSetttingsTab: 'general',
      clearCacheButtonClicked: false,
    };
  }

  setActiveSettingsTab(tab) {
    this.setState({
      activeSetttingsTab: tab,
    });
  }

  onClearCacheClicked = () => {
    this.setState({ clearCacheButtonClicked: true });
  };

  submit(e) {
    e.preventDefault();
    this.props.form.submit({
      onSuccess: form => {
        const values = form.values();
        const { accentColor } = values;
        if (accentColor.trim().length === 0) {
          values.accentColor = DEFAULT_ACCENT_COLOR;
        }
        const { progressbarAccentColor } = values;
        if (progressbarAccentColor.trim().length === 0) {
          values.progressbarAccentColor = DEFAULT_ACCENT_COLOR;
        }
        this.props.onSubmit(values);
      },
      onError: () => {},
    });
  }

  render() {
    const {
      checkForUpdates,
      installUpdate,
      form,
      updateVersion,
      isCheckingForUpdates,
      isAdaptableDarkModeEnabled,
      isUseGrayscaleServicesEnabled,
      isUpdateAvailable,
      noUpdateAvailable,
      updateIsReadyToInstall,
      updateFailed,
      showServicesUpdatedInfoBar,
      isClearingAllCache,
      onClearAllCache,
      getCacheSize,
      automaticUpdates,
      isDarkmodeEnabled,
      isSplitModeEnabled,
      openProcessManager,
      isTodosActivated,
      isOnline,
      serverURL,
    } = this.props;
    const { intl } = this.props;

    let updateButtonLabelMessage = messages.buttonSearchForUpdate;
    if (isCheckingForUpdates) {
      updateButtonLabelMessage = messages.updateStatusSearching;
    } else if (isUpdateAvailable) {
      updateButtonLabelMessage = messages.updateStatusAvailable;
    } else {
      updateButtonLabelMessage = messages.buttonSearchForUpdate;
    }

    const { lockingFeatureEnabled, scheduledDNDEnabled, reloadAfterResume } =
      window['ferdium'].stores.settings.all.app;

    let cacheSize;
    let notCleared;
    if (this.state.activeSetttingsTab === 'advanced') {
      const cacheSizeBytes = getCacheSize();
      debug('cacheSizeBytes:', cacheSizeBytes);
      if (typeof cacheSizeBytes === 'number') {
        cacheSize = prettyBytes(cacheSizeBytes);
        debug('cacheSize:', cacheSize);
        notCleared =
          this.state.clearCacheButtonClicked &&
          isClearingAllCache === false &&
          cacheSizeBytes !== 0;
      } else {
        cacheSize = '…';
        notCleared = false;
      }
    }

    const profileFolder = userDataPath();
    const recipeFolder = userDataRecipesPath();

    return (
      <div className="settings__main">
        <div className="settings__header">
          <H1>{intl.formatMessage(globalMessages.settings)}</H1>
        </div>
        <div className="settings__body">
          <form
            onSubmit={e => this.submit(e)}
            onChange={e => this.submit(e)}
            id="form"
          >
            {/* Titles */}
            <div className="recipes__navigation">
              <H5
                id="general"
                className={
                  this.state.activeSetttingsTab === 'general'
                    ? 'badge badge--primary'
                    : 'badge'
                }
                onClick={() => {
                  this.setActiveSettingsTab('general');
                }}
              >
                {intl.formatMessage(messages.headlineGeneral)}
              </H5>
              <H5
                id="services"
                className={
                  this.state.activeSetttingsTab === 'services'
                    ? 'badge badge--primary'
                    : 'badge'
                }
                onClick={() => {
                  this.setActiveSettingsTab('services');
                }}
              >
                {intl.formatMessage(messages.headlineServices)}
              </H5>
              <H5
                id="appearance"
                className={
                  this.state.activeSetttingsTab === 'appearance'
                    ? 'badge badge--primary'
                    : 'badge'
                }
                onClick={() => {
                  this.setActiveSettingsTab('appearance');
                }}
              >
                {intl.formatMessage(messages.headlineAppearance)}
              </H5>
              <H5
                id="privacy"
                className={
                  this.state.activeSetttingsTab === 'privacy'
                    ? 'badge badge--primary'
                    : 'badge'
                }
                onClick={() => {
                  this.setActiveSettingsTab('privacy');
                }}
              >
                {intl.formatMessage(messages.headlinePrivacy)}
              </H5>
              <H5
                id="language"
                className={
                  this.state.activeSetttingsTab === 'language'
                    ? 'badge badge--primary'
                    : 'badge'
                }
                onClick={() => {
                  this.setActiveSettingsTab('language');
                }}
              >
                {intl.formatMessage(messages.headlineLanguage)}
              </H5>
              <H5
                id="advanced"
                className={
                  this.state.activeSetttingsTab === 'advanced'
                    ? 'badge badge--primary'
                    : 'badge'
                }
                onClick={() => {
                  this.setActiveSettingsTab('advanced');
                }}
              >
                {intl.formatMessage(messages.headlineAdvanced)}
              </H5>
              <H5
                id="updates"
                className={
                  this.state.activeSetttingsTab === 'updates'
                    ? 'badge badge--primary'
                    : 'badge'
                }
                onClick={() => {
                  this.setActiveSettingsTab('updates');
                }}
              >
                {intl.formatMessage(messages.headlineUpdates)}
                {automaticUpdates &&
                  (updateIsReadyToInstall ||
                    isUpdateAvailable ||
                    showServicesUpdatedInfoBar) && (
                    <span className="update-available">•</span>
                  )}
              </H5>
            </div>

            {/* General */}
            {this.state.activeSetttingsTab === 'general' && (
              <div>
                <H2 className="settings__section_header">
                  {intl.formatMessage(messages.sectionMain)}
                </H2>
                <Toggle field={form.$('autoLaunchOnStart')} />
                <Toggle field={form.$('runInBackground')} />
                <Toggle field={form.$('confirmOnQuit')} />
                <Toggle field={form.$('enableSystemTray')} />
                {reloadAfterResume && <Hr />}
                <Toggle field={form.$('reloadAfterResume')} />
                {reloadAfterResume && (
                  <div>
                    <Input field={form.$('reloadAfterResumeTime')} />
                    <Hr />
                  </div>
                )}
                <Toggle field={form.$('startMinimized')} />
                {isWindows && <Toggle field={form.$('minimizeToSystemTray')} />}
                {isWindows && <Toggle field={form.$('closeToSystemTray')} />}

                <Toggle field={form.$('keepAllWorkspacesLoaded')} />

                {isTodosActivated && <Hr />}
                <Toggle field={form.$('enableTodos')} />
                {isTodosActivated && (
                  <div>
                    <Select field={form.$('predefinedTodoServer')} />
                    {form.$('predefinedTodoServer').value ===
                      'isUsingCustomTodoService' && (
                      <div>
                        <Input
                          placeholder="Todo Server"
                          onChange={e => this.submit(e)}
                          field={form.$('customTodoServer')}
                        />
                        <p
                          className="settings__message"
                          style={{
                            borderTop: 0,
                            marginTop: 0,
                            paddingTop: 0,
                            marginBottom: '2rem',
                          }}
                        >
                          {intl.formatMessage(messages.todoServerInfo)}
                        </p>
                      </div>
                    )}
                  </div>
                )}
                {isTodosActivated && <Hr />}

                {scheduledDNDEnabled && <Hr />}
                <Toggle field={form.$('scheduledDNDEnabled')} />

                {scheduledDNDEnabled && (
                  <>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                      }}
                    >
                      <div
                        style={{
                          padding: '0 1rem',
                          width: '100%',
                        }}
                      >
                        <Input
                          placeholder="17:00"
                          onChange={e => this.submit(e)}
                          field={form.$('scheduledDNDStart')}
                          type="time"
                        />
                      </div>
                      <div
                        style={{
                          padding: '0 1rem',
                          width: '100%',
                        }}
                      >
                        <Input
                          placeholder="09:00"
                          onChange={e => this.submit(e)}
                          field={form.$('scheduledDNDEnd')}
                          type="time"
                        />
                      </div>
                    </div>
                    <p>{intl.formatMessage(messages.scheduledDNDTimeInfo)}</p>
                  </>
                )}
                <p
                  className="settings__message"
                  style={{
                    borderTop: 0,
                    marginTop: 0,
                    paddingTop: 0,
                    marginBottom: '2rem',
                  }}
                >
                  <span>{intl.formatMessage(messages.scheduledDNDInfo)}</span>
                </p>
              </div>
            )}

            {/* Services */}
            {this.state.activeSetttingsTab === 'services' && (
              <div>
                <H2 className="settings__section_header">
                  {intl.formatMessage(messages.sectionServiceIconsSettings)}
                </H2>

                <Toggle field={form.$('showDisabledServices')} />
                <Toggle field={form.$('showServiceName')} />

                {isUseGrayscaleServicesEnabled && <Hr />}

                <Toggle field={form.$('useGrayscaleServices')} />

                {isUseGrayscaleServicesEnabled && (
                  <>
                    <Slider
                      type="number"
                      onChange={e => this.submit(e)}
                      field={form.$('grayscaleServicesDim')}
                    />
                    <Hr />
                  </>
                )}

                <Toggle field={form.$('showMessageBadgeWhenMuted')} />
                <Toggle field={form.$('enableLongPressServiceHint')} />
                <Select field={form.$('iconSize')} />

                <Select field={form.$('navigationBarBehaviour')} />

                <HrSections />

                <H2 className="settings__section_header">
                  {intl.formatMessage(messages.sectionHibernation)}
                </H2>
                <Select field={form.$('hibernationStrategy')} />
                <Toggle field={form.$('hibernateOnStartup')} />
                <p
                  className="settings__message"
                  style={{
                    borderTop: 0,
                    marginTop: 0,
                    paddingTop: 0,
                    marginBottom: '2rem',
                  }}
                >
                  <span>{intl.formatMessage(messages.hibernateInfo)}</span>
                </p>

                <Select field={form.$('wakeUpStrategy')} />
                <Select field={form.$('wakeUpHibernationStrategy')} />
                <Toggle field={form.$('wakeUpHibernationSplay')} />
              </div>
            )}

            {/* Appearance */}
            {this.state.activeSetttingsTab === 'appearance' && (
              <div>
                <H2 className="settings__section_header">
                  {intl.formatMessage(messages.sectionGeneralUi)}
                </H2>
                {isMac && <Toggle field={form.$('showDragArea')} />}

                <Toggle field={form.$('adaptableDarkMode')} />
                {!isAdaptableDarkModeEnabled && (
                  <Toggle field={form.$('darkMode')} />
                )}
                {(isDarkmodeEnabled || isAdaptableDarkModeEnabled) && (
                  <>
                    <Toggle field={form.$('universalDarkMode')} />
                    <p
                      className="settings__message"
                      style={{
                        borderTop: 0,
                        marginTop: 0,
                        paddingTop: 0,
                        marginBottom: '2rem',
                      }}
                    >
                      <span>
                        {intl.formatMessage(messages.universalDarkModeInfo)}
                      </span>
                    </p>
                  </>
                )}

                {isSplitModeEnabled && <Hr />}
                <Toggle field={form.$('splitMode')} />
                {isSplitModeEnabled && (
                  <Input
                    type="number"
                    min={SPLIT_COLUMNS_MIN}
                    max={SPLIT_COLUMNS_MAX}
                    placeholder={`${SPLIT_COLUMNS_MIN}-${SPLIT_COLUMNS_MAX}`}
                    onChange={e => this.submit(e)}
                    field={form.$('splitColumns')}
                  />
                )}

                <HrSections />
                <H2 className="settings__section_header">
                  {intl.formatMessage(messages.sectionAccentColorSettings)}
                </H2>
                <p>
                  {intl.formatMessage(messages.accentColorInfo, {
                    defaultAccentColor: DEFAULT_APP_SETTINGS.accentColor,
                  })}
                </p>
                <p>
                  {intl.formatMessage(messages.overallTheme)}
                  <div className="settings__settings-group__apply-color">
                    <ColorPickerInput
                      onChange={e => this.submit(e)}
                      field={form.$('accentColor')}
                      className="color-picker-input"
                    />
                  </div>
                </p>
                <p>
                  {intl.formatMessage(messages.progressbarTheme)}
                  <div className="settings__settings-group__apply-color">
                    <ColorPickerInput
                      onChange={e => this.submit(e)}
                      field={form.$('progressbarAccentColor')}
                      className="color-picker-input"
                    />
                  </div>
                </p>
                <p>
                  <div className="settings__settings-group__apply-color">
                    <Button
                      buttonType="secondary"
                      className="settings__settings-group__apply-color__button"
                      label="Apply color"
                      onClick={e => {
                        this.submit(e);
                      }}
                    />
                  </div>
                </p>
                <HrSections />

                <H2 className="settings__section_header">
                  {intl.formatMessage(messages.sectionSidebarSettings)}
                </H2>

                <Select field={form.$('serviceRibbonWidth')} />

                <Select field={form.$('sidebarServicesLocation')} />

                <Toggle field={form.$('useHorizontalStyle')} />

                <Toggle field={form.$('hideCollapseButton')} />

                <Toggle field={form.$('hideRecipesButton')} />

                <Toggle field={form.$('hideSplitModeButton')} />

                <Toggle field={form.$('hideWorkspacesButton')} />

                <Toggle field={form.$('hideNotificationsButton')} />

                <Toggle field={form.$('hideSettingsButton')} />

                <Toggle field={form.$('alwaysShowWorkspaces')} />
              </div>
            )}

            {/* Privacy */}
            {this.state.activeSetttingsTab === 'privacy' && (
              <div>
                <H2 className="settings__section_header">
                  {intl.formatMessage(messages.sectionPrivacy)}
                </H2>

                <Toggle field={form.$('privateNotifications')} />
                <Toggle field={form.$('clipboardNotifications')} />
                {(isWindows || isMac) && (
                  <Toggle field={form.$('notifyTaskBarOnMessage')} />
                )}

                <Hr />

                <Select field={form.$('webRTCIPHandlingPolicy')} />

                <p className="settings__help">
                  {intl.formatMessage(messages.appRestartRequired)}
                </p>

                <Hr />

                <Select field={form.$('searchEngine')} />

                <p className="settings__help">
                  {intl.formatMessage(messages.appRestartRequired)}
                </p>

                <Hr />

                <Toggle field={form.$('lockingFeatureEnabled')} />
                {lockingFeatureEnabled && (
                  <>
                    {isMac && systemPreferences.canPromptTouchID() && (
                      <Toggle field={form.$('useTouchIdToUnlock')} />
                    )}

                    <Input
                      placeholder={intl.formatMessage(messages.lockedPassword)}
                      onChange={e => this.submit(e)}
                      field={form.$('lockedPassword')}
                      type="password"
                      scorePassword
                      showPasswordToggle
                    />
                    <p>{intl.formatMessage(messages.lockedPasswordInfo)}</p>

                    <Input
                      placeholder="Lock after inactivity"
                      onChange={e => this.submit(e)}
                      field={form.$('inactivityLock')}
                      autoFocus
                    />
                    <p>{intl.formatMessage(messages.inactivityLockInfo)}</p>
                  </>
                )}
                <p
                  className="settings__message"
                  style={{
                    borderTop: 0,
                    marginTop: 0,
                    paddingTop: 0,
                    marginBottom: '2rem',
                  }}
                >
                  <span>
                    {intl.formatMessage(messages.lockInfo, {
                      lockShortcut: `${lockFerdiumShortcutKey(false)}`,
                    })}
                  </span>
                </p>
              </div>
            )}

            {/* Language */}
            {this.state.activeSetttingsTab === 'language' && (
              <div>
                <H2 className="settings__section_header">
                  {intl.formatMessage(messages.sectionLanguage)}
                </H2>

                <Select field={form.$('locale')} showLabel={false} />

                <Hr />

                <Toggle field={form.$('enableSpellchecking')} />
                {!isMac && form.$('enableSpellchecking').value && (
                  <Select field={form.$('spellcheckerLanguage')} />
                )}
                {isMac && form.$('enableSpellchecking').value && (
                  <p className="settings__help">
                    {intl.formatMessage(messages.spellCheckerLanguageInfo)}
                  </p>
                )}

                <p className="settings__help">
                  {intl.formatMessage(messages.appRestartRequired)}
                </p>

                <Hr />

                <Toggle field={form.$('enableTranslator')} />

                {form.$('enableTranslator').value && (
                  <Select field={form.$('translatorEngine')} />
                )}
                {form.$('enableTranslator').value && (
                  <Select field={form.$('translatorLanguage')} />
                )}

                <Hr />

                <a
                  href={FERDIUM_TRANSLATION}
                  target="_blank"
                  className="link"
                  rel="noreferrer"
                >
                  {intl.formatMessage(messages.translationHelp)}{' '}
                  <Icon icon={mdiOpenInNew} />
                </a>
              </div>
            )}

            {/* Advanced */}
            {this.state.activeSetttingsTab === 'advanced' && (
              <div>
                <H2 className="settings__section_header">
                  {intl.formatMessage(messages.sectionAdvanced)}
                </H2>

                <Toggle field={form.$('enableGPUAcceleration')} />
                <Toggle field={form.$('enableGlobalHideShortcut')} />
                <p className="settings__help indented__help">
                  {intl.formatMessage(messages.appRestartRequired)}
                </p>

                <Hr />

                <Input
                  placeholder="User Agent"
                  onChange={e => this.submit(e)}
                  field={form.$('userAgentPref')}
                />
                <p className="settings__help">
                  {intl.formatMessage(globalMessages.userAgentHelp)}
                </p>
                <p className="settings__help">
                  {intl.formatMessage(messages.appRestartRequired)}
                </p>

                <Hr />

                <div className="settings__settings-group">
                  <H3>{intl.formatMessage(messages.subheadlineCache)}</H3>
                  <p>
                    {intl.formatMessage(messages.cacheInfo, {
                      size: cacheSize,
                    })}
                  </p>
                  {notCleared && (
                    <p>{intl.formatMessage(messages.cacheNotCleared)}</p>
                  )}
                  <div className="settings__settings-group">
                    <div className="settings__open-settings-cache-container">
                      <Button
                        buttonType="secondary"
                        label={intl.formatMessage(messages.buttonClearAllCache)}
                        className="settings__open-settings-cache-button"
                        onClick={() => {
                          onClearAllCache();
                          this.onClearCacheClicked();
                        }}
                        disabled={isClearingAllCache}
                        loaded={!isClearingAllCache}
                      />
                      <Button
                        buttonType="secondary"
                        label="Open Process Manager"
                        className="settings__open-settings-cache-button"
                        onClick={openProcessManager}
                      />
                    </div>
                  </div>
                </div>

                <Hr />

                <div className="settings__settings-group">
                  <H3>
                    {intl.formatMessage(messages.subheadlineFerdiumProfile)}
                  </H3>
                  <p>
                    <div className="settings__open-settings-file-container">
                      <Button
                        buttonType="secondary"
                        label={intl.formatMessage(
                          messages.buttonOpenFerdiumProfileFolder,
                        )}
                        className="settings__open-settings-file-button"
                        onClick={() => openPath(profileFolder)}
                      />
                      <Button
                        buttonType="secondary"
                        label={intl.formatMessage(
                          messages.buttonOpenFerdiumServiceRecipesFolder,
                        )}
                        className="settings__open-settings-file-button"
                        onClick={() => openPath(recipeFolder)}
                      />
                      <Button
                        buttonType="secondary"
                        label={intl.formatMessage(
                          messages.buttonOpenImportExport,
                        )}
                        className="settings__open-settings-file-button"
                        onClick={() => openExternalUrl(serverURL, true)}
                      />
                    </div>
                  </p>
                  <p className="settings__help">
                    {intl.formatMessage(messages.serverHelp, {
                      serverURL,
                    })}
                  </p>
                </div>
              </div>
            )}

            {/* Updates */}
            {this.state.activeSetttingsTab === 'updates' && (
              <div>
                <H2 className="settings__section_header">
                  {intl.formatMessage(messages.sectionUpdates)}
                </H2>

                <Toggle field={form.$('automaticUpdates')} />
                {automaticUpdates && (
                  <>
                    <>
                      <div>
                        <Toggle field={form.$('beta')} />
                        {updateIsReadyToInstall ? (
                          <Button
                            label={intl.formatMessage(
                              messages.buttonInstallUpdate,
                            )}
                            onClick={installUpdate}
                          />
                        ) : (
                          <Button
                            buttonType="secondary"
                            label={intl.formatMessage(updateButtonLabelMessage)}
                            onClick={checkForUpdates}
                            disabled={
                              !automaticUpdates ||
                              isCheckingForUpdates ||
                              isUpdateAvailable ||
                              !isOnline
                            }
                            loaded={!isCheckingForUpdates || !isUpdateAvailable}
                          />
                        )}
                        {(isUpdateAvailable || updateIsReadyToInstall) && (
                          <Button
                            className="settings__updates__changelog-button"
                            label={intl.formatMessage(
                              messages.buttonShowChangelog,
                            )}
                            onClick={() => {
                              window.location.href = `#/releasenotes${updateVersionParse(
                                updateVersion,
                              )}`;
                            }}
                          />
                        )}
                        <br />
                        <br />
                      </div>
                      <p>
                        {intl.formatMessage(messages.currentVersion)}{' '}
                        {ferdiumVersion}
                      </p>
                      {noUpdateAvailable && (
                        <p>
                          {intl.formatMessage(messages.updateStatusUpToDate)}.
                        </p>
                      )}
                      {updateFailed && (
                        <Infobox type="danger" icon="alert">
                          &nbsp;An error occurred (check the console for more
                          details)
                        </Infobox>
                      )}
                    </>
                    {showServicesUpdatedInfoBar ? (
                      <>
                        <p>
                          <Icon icon={mdiPowerPlug} />
                          {intl.formatMessage(messages.servicesUpdated)}
                        </p>
                        <Button
                          label={intl.formatMessage(
                            messages.buttonReloadServices,
                          )}
                          onClick={() => window.location.reload()}
                        />
                      </>
                    ) : (
                      <p>
                        <Icon icon={mdiPowerPlug} />
                        &nbsp;Your services are up-to-date.
                      </p>
                    )}
                  </>
                )}
                <p className="settings__message">
                  <Icon icon={mdiGithub} /> Ferdium is based on{' '}
                  <a
                    href={`${GITHUB_FRANZ_URL}/franz`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Franz
                  </a>
                  , a project published under the{' '}
                  <a
                    href={`${GITHUB_FRANZ_URL}/franz/blob/master/LICENSE`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Apache-2.0 License
                  </a>
                </p>
              </div>
            )}
          </form>
        </div>
      </div>
    );
  }
}

export default injectIntl(observer(EditSettingsForm));
